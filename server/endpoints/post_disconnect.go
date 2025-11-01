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
		log.Printf("ERROR: Invalid JSON: %v", err)
		c.JSON(400, structs.ErrorResponse{
			Message: "invalid JSON",
		})
		return
	}

	if req.TargetUserID == "" || req.TargetUserID == userID {
		log.Printf("ERROR: Invalid target_user_id")
		c.JSON(400, structs.ErrorResponse{
			Message: "invalid target_user_id",
		})
		return
	}

	ctx := context.Background()

	// 1. Set reaction to dislike
	err := database.UpsertReaction(ctx, internal.DB, userID, req.TargetUserID, database.ReactionDislike)
	if err != nil {
		log.Printf("ERROR updating reaction: %v", err)
		c.JSON(500, structs.ErrorResponse{
			Message: "db error",
		})
		return
	}

	// 2. Delete the connection
	_, err = internal.DB.Exec(ctx, `
		DELETE FROM connections 
		WHERE (requester_user_id = $1 AND target_user_id = $2)
		   OR (requester_user_id = $2 AND target_user_id = $1)
	`, userID, req.TargetUserID)
	
	if err != nil {
		log.Printf("ERROR deleting connection: %v", err)
	} 

	// 3. Delete the chat
	_, err = internal.DB.Exec(ctx, `
		DELETE FROM chats 
		WHERE (user1_id = $1 AND user2_id = $2)
		   OR (user1_id = $2 AND user2_id = $1)
	`, userID, req.TargetUserID)
	
	if err != nil {
		log.Printf("ERROR deleting chat: %v", err)
	} 

	c.JSON(200, gin.H{
		"status":         "ok",
		"userID":         userID,
		"target_user_id": req.TargetUserID,
		"reaction":       "dislike",
	})

}
