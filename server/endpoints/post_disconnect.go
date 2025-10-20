package endpoints

import (
	"context"
	"log"
	"matchme-server/database"
	"matchme-server/internal"
	"matchme-server/structs"

	"github.com/gin-gonic/gin"
)

type disconnectReq struct {
	TargetUserID string `json:"target_user_id"`
}

// POST /api/reactions/disconnect
func PostDisconnect(c *gin.Context) {
	userID := c.GetString("userID")

	var req disconnectReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, structs.ErrorResponse{
			Message: "invalid JSON",
		})

		return
	}

	if req.TargetUserID == "" || req.TargetUserID == userID {
		c.JSON(400, structs.ErrorResponse{
			Message: "invalid target_user_id",
		})
		return
	}

	ctx := context.Background()
	err := database.UpsertReaction(ctx, internal.DB, userID, req.TargetUserID, database.Reaction("dislike"))
	if err != nil {
		log.Println(err)
		c.JSON(500, structs.ErrorResponse{
			Message: "db error",
		})
	}

	c.JSON(200, gin.H{
		"status":         "ok",
		"userID":         userID,
		"target_user_id": req.TargetUserID,
		"reaction":       "dislike",
	})

}
