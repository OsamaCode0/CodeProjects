package structs

import (
	"time"
)

// for frontend. that it will always expect same format
type ErrorResponse struct {
	Field   string `json:"field,omitempty"` //omitempty, it won’t appear in the JSON if empty
	Message string `json:"message"`
}

type RegisterInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

//CHANGED MY MIND))) FRONTEND WILL DEAL WITH IT
/*
type Gender string

const (
	GenderFemale Gender = "female"
	GenderMale Gender = "male"
	GenderPreferNoSay Gender = "prefer_not_to_say"
	GenderNonBinary Gender = "non_binary"
)

var CatalogLang = map[string]string{
	"en": "English",
	"fr": "French",
	"ru": "Russian",
	"es": "Spanish",
	"de": "German",
	"fi": "Finnish",
	"sv": "Swedish",
	"it": "Italian",
	"pl": "Polish",
	"uk": "Ukrainian",
	"pt": "Portuguese",
	"nl": "Dutch",
	"tr": "Turkish",
	"ar": "Arabic",
	"zh": "Chinese",
	"ja": "Japanese",
	"ko": "Korean",
}*/

type ParentProfile struct {
	UserID            string    `json:"userId"`
	Name              string    `json:"name"`
	Gender            string    `json:"gender"`
	About             string    `json:"about,omitempty"`
	LanguageCodes     []string  `json:"languageCodes"`
	AddressCity       string    `json:"addressCity,omitempty"`
	PreferredDistance int       `json:"preferredDistanceKm,omitempty"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

type Child struct {
	UserID         string    `json:"userId"`
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
