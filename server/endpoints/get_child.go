package endpoints

import (
	"context"
	"log"
	"matchme-server/database"
	"matchme-server/helpers"
	"matchme-server/internal"
	"matchme-server/structs"
	"time"

	"github.com/gin-gonic/gin"
)

type ChildProfileResponse struct {
	Name           string    `json:"name"`
	Birthday       time.Time `json:"birthday"`
	Gender         string    `json:"gender"`
	About_short    string    `json:"about_short"`
	Interests      []string  `json:"intersts"`
	Activity_level string    `json:"activity_level"`
	Limitations    []string  `json:"limitations"`
	Allergies      []string  `json:"allergies"`
	Play_styles    []string  `json:"play_styles"`
}

func GetChildProfile(c *gin.Context) {
	id := c.GetString("userID")
	if !helpers.IsValidID(id) {
		log.Println(id)
		c.JSON(400, structs.ErrorResponse{
			Message: "invalid id",
		})
		return
	}

	ctx := context.Background()
	ch, err := database.GetChildProfile(ctx, internal.DB, id)
	if err != nil {
		log.Println(err)
		c.JSON(500, structs.ErrorResponse{
			Message: "db error",
		})
		return
	}

	if ch == nil {
		ch = &structs.Child{}
	}
	res := buildChildResponse(ch)
	c.JSON(200, res)
}

func buildChildResponse(ch *structs.Child) ChildProfileResponse {

	return ChildProfileResponse{

		Name:           ch.Name,
		Birthday:       ch.Birthday,
		Gender:         ch.Gender,
		About_short:    ch.About_short,
		Interests:      ch.Interests,
		Activity_level: ch.Activity_level,
		Limitations:    ch.Limitations,
		Allergies:      ch.Allergies,
		Play_styles:    ch.Play_styles,
	}
}
