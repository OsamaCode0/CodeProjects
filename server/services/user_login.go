package services

import (
	"errors"
	"matchme-server/database"
	"matchme-server/internal"
	"matchme-server/structs"
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

	id, pwHash, err := database.GetUserByEmail(c.Request.Context(), internal.DB, input.Email)

	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(401, structs.ErrorResponse{
			Message: "user does not exist",
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

	access, err := makeAccessToken(id)
	if err != nil {
		c.JSON(500, structs.ErrorResponse{
			Message: "token error",
		})
		return
	}
	c.JSON(200, gin.H{
		"user_id":      id,
		"access_token": access,
	})
}

func makeAccessToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).
		SignedString([]byte(internal.Cfg.JWTSecret))
}
