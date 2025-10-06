package endpoints

import (
	"log"
	"matchme-server/database"
	"matchme-server/internal"

	"github.com/gin-gonic/gin"
)

func PostMePhoto(c *gin.Context) {
    userID := c.GetString("userID")

    var body struct {
        PublicID string `json:"public_id" binding:"required"`
        Version  int    `json:"version" binding:"required"`
    }

    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(400, gin.H{"error": "Invalid payload"})
        return
    }

    expected := "users/" + userID + "/avatar"
    if body.PublicID != expected {
        c.JSON(400, gin.H{"error": "Invalid public_id"})
        return
    }

    if body.Version <= 0 {
        c.JSON(400, gin.H{"error": "Invalid version"})
        return
    }

    if err := database.SaveUserPhoto(c, internal.DB, userID, body.PublicID, body.Version); err != nil {
        log.Println(err)
        c.JSON(500, gin.H{"error": "Failed to save photo"})
        return
    }

    c.Status(204)
}
