package endpoints

import (
	"context"
	"log"
	"matchme-server/database"
	"matchme-server/helpers"
	"matchme-server/internal"
	"matchme-server/structs"

	"github.com/gin-gonic/gin"
)

func LoadProfiles(c *gin.Context) (*structs.ParentProfile, *structs.Child, bool) {
	id := c.Param("id")

	if !helpers.IsValidID(id) {
		c.JSON(400, structs.ErrorResponse{
			Message: "invalid id",
		})
		return nil, nil, false
	}

	ctx := context.Background()
	p, err := database.GetUserProfile(ctx, internal.DB, id)
	if err != nil {
		log.Println(err)
		c.JSON(500, structs.ErrorResponse{
			Message: "db error",
		})
		return nil, nil, false
	}

	if p == nil {
		log.Println(err)
		c.JSON(400, structs.ErrorResponse{
			Message: "parent profile not found",
		})
		return nil, nil, false
	}

	ch, err := database.GetChildProfile(ctx, internal.DB, id)
	if err != nil {
		log.Println(err)
		c.JSON(500, structs.ErrorResponse{
			Message: "db error",
		})
		return nil, nil, false
	}

	if ch == nil {
		log.Println(err)
		c.JSON(400, structs.ErrorResponse{
			Message: "child profile not found",
		})
		return nil, nil, false
	}
	return p, ch, true
}
