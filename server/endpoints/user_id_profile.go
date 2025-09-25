package endpoints

import (
	"matchme-server/helpers"
	"github.com/gin-gonic/gin"
)

type ChildRespond struct {
	Name         string   `json:"name"`
	AgeYears     int      `json:"ageYears"`
	Gender       string   `json:"gender"`
	AboutShort   string   `json:"aboutShort"`
	TopInterests []string `json:"topInterests"`
}

type ProfileRespond struct {
	ID          string       `json:"id"`
	Name        string       `json:"name"`
	About       string       `json:"about"`
	Languages   []string     `json:"languages"`
	AddressCity string       `json:"addressCity"`
	Child       ChildRespond `json:"child"`
}

func GetProfile(c *gin.Context) {
	p, ch, ok := LoadProfiles(c)

	if !ok {
		
		return//json respond already sent in LoadProfiles func
	}

	childAge := helpers.ComputeAge(ch.Birthday)

	res := ProfileRespond{
		ID:           p.UserID,
		Name:         p.Name,
		About:        p.About,
		Languages:    p.LanguageCodes,
		AddressCity:  p.AddressCity,
		Child: ChildRespond{
			Name: ch.Name,
			AgeYears: childAge,
			Gender: ch.Gender,
			AboutShort: ch.About_short,
			TopInterests: ch.Interests,
		},
	}

	c.JSON(200, res)
}
