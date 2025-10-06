package endpoints

import (
	"crypto/sha1"
	"encoding/hex"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// GET /api/me/cloudinary-sign
func CloudinarySign(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.AbortWithStatus(401)
		return
	}

	folder := "users/" + userID
	ts := strconv.FormatInt(time.Now().Unix(), 10)

	publicID := "avatar"   // fixed id for single-avatar model
	overwrite := "true"    // must be string

	// Keys MUST be alphabetical: folder, overwrite, public_id, timestamp
	raw := "folder=" + folder +
		"&overwrite=" + overwrite +
		"&public_id=" + publicID +
		"&timestamp=" + ts +
		os.Getenv("CLOUDINARY_API_SECRET")

	sum := sha1.Sum([]byte(raw))
	sig := hex.EncodeToString(sum[:])

	cloud := strings.TrimSpace(os.Getenv("CLOUDINARY_CLOUD_NAME"))
	if cloud == "" {
		log.Println("CLOUDINARY_CLOUD_NAME is empty")
	}

	c.JSON(200, gin.H{
		"cloud_name": cloud,
		"api_key":    os.Getenv("CLOUDINARY_API_KEY"),
		"timestamp":  ts,
		"signature":  sig,
		"folder":     folder,
		"public_id":  publicID,   // <-- MISSING BEFORE
		"overwrite":  overwrite,  // keep as string
	})
}
