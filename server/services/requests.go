package services

import (
	"context"
	"fmt"
	"log"
	"matchme-server/database"
	"matchme-server/internal"
	"matchme-server/structs"

	"github.com/gin-gonic/gin"
)

func GetRequests(c *gin.Context){
	userID := c.GetString("userID")
	
	ctx := context.Background()
	

	percent, err := database.GetProfileCompletionPercent(ctx, internal.DB, userID)
	if err != nil {
		log.Println(err)
		c.JSON(500, structs.ErrorResponse{
			Message: CommonErr,
		})
		return
	}

	if percent < 100 {
		c.JSON(400, structs.ErrorResponse{
			Message: "profile did not complete",
		})
		return
	}
	
	requests, err := database.GetRequests(ctx, internal.DB, userID)
	if err != nil {
		log.Println(err)
		c.JSON(500, structs.ErrorResponse{
			Message: CommonErr,
		})
		return
	}
	fmt.Println(userID)
	fmt.Println(requests)
	c.JSON(200,requests)
}