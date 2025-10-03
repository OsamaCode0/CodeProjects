package endpoints

import (
	"crypto/sha1"
	"encoding/hex"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// GET /api/me/cloudinary-sign
func CloudinarySign(c *gin.Context) {
  userID := c.GetString("userID")
  folder := "users/" + userID
  ts := strconv.FormatInt(time.Now().Unix(), 10)

  // signature of "folder=...&timestamp=...<API_SECRET>"
  raw := "folder=" + folder + "&timestamp=" + ts + os.Getenv("CLOUDINARY_API_SECRET")
  h := sha1.Sum([]byte(raw))
  sig := hex.EncodeToString(h[:])

  c.JSON(200, gin.H{
    "cloud_name": os.Getenv("CLOUDINARY_CLOUD_NAME"),
    "api_key":    os.Getenv("CLOUDINARY_API_KEY"),
    "timestamp":  ts,
    "signature":  sig,
    "folder":     folder,
  })
}
