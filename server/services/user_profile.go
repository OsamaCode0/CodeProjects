package services

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"matchme-server/database"
	"matchme-server/internal"
	"matchme-server/structs"
)

// func for updating or filling the profile
// handlers/me_profile.go

type PatchParentProfileInput struct {
	Name              *string   `json:"name,omitempty"`
	Gender            *string   `json:"gender,omitempty"`
	About             *string   `json:"about,omitempty"`
	LanguageCodes     *[]string `json:"languageCodes,omitempty"` // pointer to slice
	AddressCity       *string   `json:"addressCity,omitempty"`
	PreferredDistance *int      `json:"preferred_distance_km,omitempty"`
}

func PatchMeProfile(c *gin.Context) {
	uid := c.GetString("userID") // set by middleware
	table := "parent_profiles"

	var in PatchParentProfileInput
	log.Printf("PATCH /me/profile input: %#v", in)
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(400, structs.ErrorResponse{
			Message: CommonErr})
		return
	}


	sets := []string{}
	args := []any{uid}
	i := 2
	updatedCols := make([]string, 0, 6)

	add := func(col string, v any) {
		sets = append(sets, fmt.Sprintf("%s=$%d", col, i))
		args = append(args, v)
		i++
		updatedCols = append(updatedCols, col)
	}

	if in.Name != nil {
		add("name", *in.Name)
	}
	if in.Gender != nil {
		add("gender", *in.Gender)
	}
	if in.About != nil {
		add("about", *in.About)
	}
	if in.LanguageCodes != nil {
		add("language_codes", *in.LanguageCodes) // pgx: []string -> TEXT[]
	}
	if in.AddressCity != nil {
		add("address_city", *in.AddressCity)
	}
	if in.PreferredDistance != nil {
		add("preferred_distance_km", *in.PreferredDistance)
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
		table,
	)

	if err != nil {
		if errors.Is(err, database.ErrProfileNotFound) {
			c.JSON(404, structs.ErrorResponse{
				Message: "parent profile not found",
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
