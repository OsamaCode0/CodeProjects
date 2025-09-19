package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"matchme-server/structs"
	"matchme-server/internal"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
)

// POST /login
func Login(c *gin.Context) {
	var input structs.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, structs.ErrorResponse{
			Message: "invalid json"})
		return
	}

	var id, pwHash string
	err := internal.DB.QueryRow(context.Background(),
		`SELECT id, password_hash FROM users WHERE email=$1`, input.Email).Scan(&id, &pwHash)

	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(401, structs.ErrorResponse{
			Message: "invalid credentials",
		})
		return
	}
	if err != nil {
		c.JSON(500, structs.ErrorResponse{
			Message: "db error",
		})
		return
	}

	if !IsCorrectPassword(pwHash, input.Password) {
		c.JSON(401, structs.ErrorResponse{
			Message: "invalid credentials",
		})
		return
	}

	// access JWT (15m)
	access, err := makeAccessToken(id)
	if err != nil {
		c.JSON(500, structs.ErrorResponse{
			Message: "token error",
		})
		return
	}

	// token — store hash, set cookie
	plain, hash, err := makeToken()
	if err != nil {
		c.JSON(500, structs.ErrorResponse {
			Message: "token error",
		})
		return
	}

// Store the **hash** of the refresh token (not the plain token) for 30 days
	_, err = internal.DB.Exec(context.Background(),
		`INSERT INTO tokens (user_id, token_hash) VALUES ($1,$2)`,
		id, hash)
	if err != nil {
		c.JSON(500, structs.ErrorResponse{Message: "token store error"})
		return
	}

	// HttpOnly cookie 
	c.SetCookie("token", plain, 30*24*3600, "/", "", false, true)

	c.JSON(200, gin.H{"user_id": id, "access_token": access})
}


func makeAccessToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(15 * time.Minute).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).
		SignedString([]byte(internal.Cfg.JWTSecret))
}


func makeToken() (plain, hash string, err error) {
	b := make([]byte, 32)
	_, err = rand.Read(b)
	if err != nil {
		return
	}

	plain = base64.RawURLEncoding.EncodeToString(b)
	sum := sha256.Sum256([]byte(plain))
	hash = hex.EncodeToString(sum[:])
	return
}
