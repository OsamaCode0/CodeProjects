package middleware

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"matchme-server/internal"

	"github.com/gin-gonic/gin"
)

//we need this function in order to return user id by checking the tocken
func RequireSession() gin.HandlerFunc {
  return func(c *gin.Context) {
    plain, err := c.Cookie("token")
    if err != nil || plain == "" { 
      c.AbortWithStatus(401); 
      return }

    hash := hashToken(plain)

    var uid string
    err = internal.DB.QueryRow(context.Background(),
    //token_hash is UNIQUE, LIMIT 1 is optional (there can’t be 2 rows anyway).
      `SELECT user_id FROM tokens WHERE token_hash=$1 LIMIT 1`, hash,).Scan(&uid)
    if err != nil { c.AbortWithStatus(401); return }

    c.Set("userID", uid)
    c.Next()
  }
}

func hashToken(plain string) string {
  sum := sha256.Sum256([]byte(plain))
  return hex.EncodeToString(sum[:])
}
