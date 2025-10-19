package services

import (
	"errors"
	"fmt"
	"log"
	"time" // ✅ ДОБАВЛЕН ИМПОРТ
	"matchme-server/database"
	"matchme-server/internal"
	"matchme-server/structs"
	"github.com/gin-gonic/gin"
)

type PatchChildProfileInput struct {
	Name           *string   `json:"name,omitempty"`
	Birthday       *string   `json:"birthday,omitempty"`
	Gender         *string   `json:"gender,omitempty"`
	About_short    *string   `json:"about_short,omitempty"`
	Interests      *[]string `json:"interests"`
	Activity_level *string   `json:"activity_level"`
	Limitations    *[]string `json:"limitations"`
	Allergies      *[]string `json:"allergies"`
	Play_styles    *[]string `json:"play_styles"`
}

func PatchMeChild(c *gin.Context) {
	uid := c.GetString("userID") // set by middleware

	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM children WHERE user_id = $1)`
	err := internal.DB.QueryRow(c.Request.Context(), checkQuery, uid).Scan(&exists)
	if err != nil {
		log.Println("Check ownership error:", err)
		c.JSON(500, structs.ErrorResponse{Message: "Database error"})
		return
	}
	if !exists {
		c.JSON(404, structs.ErrorResponse{Message: "Child profile not found"})
		return
	}

	var in PatchChildProfileInput
	if err := c.ShouldBindJSON(&in); err != nil {
		log.Println(err)
		c.JSON(400, structs.ErrorResponse{Message: "invalid json"})
		return
	}

	sets := []string{}
	args := []any{uid}
	i := 2
	updatedCols := make([]string, 0, 10)

	add := func(col string, v any) {
		sets = append(sets, fmt.Sprintf("%s=$%d", col, i))
		args = append(args, v)
		i++
		updatedCols = append(updatedCols, col)
	}

	if in.Name != nil {
		add("name", *in.Name)
	}

	// changes to date format
	if in.Birthday != nil {
		parsed, err := time.Parse("2006-01-02", *in.Birthday)
		if err != nil {
			c.JSON(400, structs.ErrorResponse{
				Message: "Invalid date format. Use YYYY-MM-DD",
			})
			return
		}
		add("birthday", parsed)
	}

	if in.Gender != nil {
		add("gender", *in.Gender)
	}
	if in.About_short != nil {
		add("about_short", *in.About_short)
	}
	if in.Interests != nil {
		add("interests", *in.Interests)
	}
	if in.Activity_level != nil {
		add("activity_level", *in.Activity_level)
	}
	if in.Limitations != nil {
		add("limitations", *in.Limitations)
	}
	if in.Allergies != nil {
		add("allergies", *in.Allergies)
	}
	if in.Play_styles != nil {
		add("play_styles", *in.Play_styles)
	}

	if len(sets) == 0 {
		c.JSON(400, structs.ErrorResponse{
			Message: "no fields to update",
		})
		return
	}

	m, err := database.UpdateProfileDynamic(
		c.Request.Context(),
		internal.DB,
		sets,
		args,
		updatedCols,
		"children", 
	)

	if err != nil {
		log.Println(err)
		if errors.Is(err, database.ErrProfileNotFound) {
			c.JSON(404, structs.ErrorResponse{
				Message: "child profile not found",
			})
			return
		}
		c.JSON(500, structs.ErrorResponse{
			Message: CommonErr,
		})
		return
	}

	c.JSON(200, m)
}