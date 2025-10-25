package endpoints

import (
	"context"
	"log"
	"matchme-server/database"
	"matchme-server/internal"
	"matchme-server/structs"

	"github.com/gin-gonic/gin"
)

// POST /api/recommendations/:targetUserId/reaction
func PostReaction(c *gin.Context) {
	userID := c.GetString("userID")
	targetID := c.Param("targetUserId")

	var req struct {
		Reaction string `json:"reaction"` // "like" | "dislike"
	}
	if err := c.BindJSON(&req); err != nil || (req.Reaction != "like" && req.Reaction != "dislike") {
		c.JSON(400, structs.ErrorResponse{
			Message: "reaction must be 'like' or 'dislike'",
		})
		return
	}

	ctx := context.Background()
	
	// Record the reaction
	err := database.UpsertReaction(ctx, internal.DB, userID, targetID, database.Reaction(req.Reaction))
	if err != nil {
		log.Println(err)
		c.JSON(500, structs.ErrorResponse{
			Message: "db error",
		})
		return
	}

	// If it's a like, check if it's a match and create connection request
	if req.Reaction == "like" {
		// Check if this created a match (both users liked each other)
		var isMatch bool
		err := internal.DB.QueryRow(ctx, `
			SELECT is_match 
			FROM user_reactions 
			WHERE user_id = $1 AND target_user_id = $2
		`, userID, targetID).Scan(&isMatch)
		
		if err != nil {
			log.Printf("Error checking match status: %v", err)
		} else if isMatch {
			// It's a match! Create connection request automatically
			log.Printf("🎉 MATCH! Creating connection request between %s and %s", userID, targetID)
			
			_, err := database.CreateConnectionRequest(ctx, internal.DB, userID, targetID)
			if err != nil {
				// Connection might already exist, that's okay
				if err != database.ErrConnectionExists {
					log.Printf("Error creating connection request: %v", err)
				} else {
					log.Printf("Connection already exists between users")
				}
			} else {
				log.Printf("✅ Connection request created successfully")
			}
		}
	}

	c.JSON(200, gin.H{
		"reaction": req.Reaction,
		"status":   "ok",
	})
}