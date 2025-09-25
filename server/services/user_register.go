package services

import (
	"log"
	"matchme-server/database"
	"matchme-server/helpers"
	"matchme-server/internal"
	"matchme-server/structs"

	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
	var input structs.RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, structs.ErrorResponse{
			Message: "invalid json",
		})
		return
	}

	if !helpers.IsValidEmail(input.Email) {
		c.JSON(400, structs.ErrorResponse{
			Field:   "email",
			Message: "email is invalid",
		})
		return
	}

	if !helpers.IsUniqEmail(input.Email) {
		c.JSON(400, structs.ErrorResponse{
			Field:   "email",
			Message: "email already exists",
		})
		return
	}

	if !helpers.IsValidPassword(input.Password) {
		c.JSON(400, structs.ErrorResponse{
			Field:   "password",
			Message: "password is not valid",
		})
		return
	}

	hashedPassword, err := helpers.HashPassword(input.Password)
	if err != nil {
		log.Println(err)
		c.JSON(500, structs.ErrorResponse{
			Field:   "password",
			Message: "password hashing failed",
		})
		return
	}

	id, createdAt, err := database.CreateUser(c.Request.Context(), internal.DB, input.Email, hashedPassword)
	if err != nil {
		log.Println(err)
		c.JSON(500, structs.ErrorResponse{
			Message:  "insert to DB failed",
		})
		return
	}


	c.JSON(201, gin.H{"id": id, "email": input.Email, "created_at": createdAt})
}

