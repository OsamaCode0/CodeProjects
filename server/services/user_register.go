package services

import (
	"context"
	"errors"
	"log"
	"matchme-server/database"
	"matchme-server/internal"
	"matchme-server/structs"
	"regexp"
	"strings"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *gin.Context) {
	var input structs.RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, structs.ErrorResponse{
			Message: "invalid json",
		})
		return
	}

	if !isValidEmail(input.Email) {
		c.JSON(400, structs.ErrorResponse{
			Field:   "email",
			Message: "email is invalid",
		})
		return
	}

	if !isUniqEmail(input.Email) {
		c.JSON(400, structs.ErrorResponse{
			Field:   "email",
			Message: "email already exists",
		})
		return
	}

	if !isValidPassword(input.Password) {
		c.JSON(400, structs.ErrorResponse{
			Field:   "password",
			Message: "password is not valid",
		})
		return
	}

	hashedPassword, err := hashPassword(input.Password)
	if err != nil {
		c.JSON(500, structs.ErrorResponse{
			Field:   "password",
			Message: "password hashing failed",
		})
		return
	}

	id, createdAt, err := database.CreateUser(c.Request.Context(), internal.DB, input.Email, hashedPassword)
	if err != nil {
		c.JSON(500, structs.ErrorResponse{
			Message:  "insert to DB failed",
		})
		return
	}


	c.JSON(201, gin.H{"id": id, "email": input.Email, "created_at": createdAt})
}



// herper functions

func isValidEmail(email string) bool {
	email = strings.TrimSpace(email)
	emailRe := regexp.MustCompile(`^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$`)
	return emailRe.MatchString(email)
}

func isUniqEmail(email string) bool {
	const q = `SELECT NOT EXISTS (SELECT 1 FROM users WHERE email = $1);`
	var unique bool
	err := internal.DB.QueryRow(context.Background(), q, email).Scan(&unique)
	if err != nil {
		log.Println("db error:", err)
		return false
	}
	return unique
}

func isValidPassword(password string) bool {
	//just 6 symbols with at least 1 letter
	if len(password) < 6 {
		return false
	}
	// must contain at least one letter
	re := regexp.MustCompile(`[A-Za-z]`)
	return re.MatchString(password)

}

func hashPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	//for unhash err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(password))
	if err != nil {
		log.Println("password hashing failed")
		return "", errors.New("password hashing failed")
	}
	return string(hashed), nil
}

func IsCorrectPassword(hashed, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashed), []byte(password))
	if err != nil {
		log.Println("wrong password")
		return false		
	}
	return true
}
