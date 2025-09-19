package services

import "github.com/gin-gonic/gin"

//func for updating or filling the profile
// handlers/me_profile.go
func PatchMeProfile(c *gin.Context) {
    uid := c.GetString("userID")       // set by your middleware
    c.JSON(200, gin.H{"userID": uid})  // TEMP: sanity check
}


