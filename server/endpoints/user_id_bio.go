package endpoints

import (
	"time"
	"github.com/gin-gonic/gin"
)

type ChildBio struct {
	Birthday       time.Time `json:"birthday"`
	Gender         string    `json:"gender"`
	Interests      []string  `json:"intersts"`
	Activity_level string    `json:"activity_level"`
	Limitations    []string  `json:"limitations"`
	Allergies      []string  `json:"allergies"`
	Play_styles    []string  `json:"play_styles"`
}

type BioRespond struct {
	ID                string   `json:"id"`
	Gender            string   `json:"gender"`
	Languages         []string `json:"languages"`
	AddressCity       string   `json:"addressCity"`
	PrefferedDistance int      `json:"prefferedDistance"`
	Child             ChildBio `json:"child"`
}

func GetBio(c *gin.Context) {
	p, ch, ok := LoadProfiles(c)

	if !ok {

		return //json respond already sent in LoadProfiles func
	}

	res := BioRespond {
		ID:                p.UserID,
		Gender:            p.Gender,
		Languages:         p.LanguageCodes,
		AddressCity:       p.AddressCity,
		PrefferedDistance: p.PreferredDistance,

		Child: ChildBio {
			Birthday:       ch.Birthday,
			Gender:         ch.Gender,
			Interests:      ch.Interests,
			Activity_level: ch.Activity_level,
			Limitations:    ch.Limitations,
			Allergies:      ch.Allergies,
			Play_styles:    ch.Play_styles,
		},
	}

	c.JSON(200, res)
}
