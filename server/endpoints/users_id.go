package endpoints

import (
	"context"
	"log"
	"matchme-server/database"
	"matchme-server/internal"
	"matchme-server/structs"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UserById struct {
	UserID    string `json:"userId"`
	Name      string `json:"name"`
	AvatarUrl string `json:"avatarurl"`
}

func GetUserById(c *gin.Context) {
	var out UserById
	id := c.Param("id")
	if !isValidID(id) {
		c.JSON(400, structs.ErrorResponse{
			Message: "invalid id",
		})
		return
	}

	ctx := context.Background()
	err, Exists := database.EnsureUserExists(ctx, internal.DB, id)
	if err != nil {
		log.Println(err)
		c.JSON(500, structs.ErrorResponse{
			Message: "db error",
		})
		return
	}

	if !Exists {
		c.JSON(400, structs.ErrorResponse{
			Message: "user does not exist",
		})
		return
	}

	out.Name, out.AvatarUrl = database.GetUserName_photoUrl(ctx, internal.DB, id)
	out.UserID = id

	c.JSON(200, out)

}

func isValidID(id string) bool {
	_, err := uuid.Parse(strings.TrimSpace(id))
	return err == nil
}
