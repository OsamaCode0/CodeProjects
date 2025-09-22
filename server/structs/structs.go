package structs

import "time"

//for frontend. that it will always expect same format
type ErrorResponse struct {
	Field string `json:"field,omitempty"`//omitempty, it won’t appear in the JSON if empty
	Message string `json:"message"`

}

type RegisterInput struct {
	Email string `json:"email"`
	Password string `json:"password"`
}

type LoginInput struct {
	Email string `json:"email"`
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
    UserID             string    `db:"user_id" json:"userId"`
    Name               string    `db:"name" json:"name"`
    Gender             string   `db:"gender" json:"gender"`
    About              string   `db:"about" json:"about,omitempty"`
    LanguageCodes      []string  `db:"language_codes" json:"languageCodes"`
    AddressCity        string   `db:"address_city" json:"addressCity,omitempty"`
    PreferredDistance  int      `db:"preferred_distance_km" json:"preferredDistanceKm,omitempty"`
    CreatedAt          time.Time `db:"created_at" json:"createdAt"`
    UpdatedAt          time.Time `db:"updated_at" json:"updatedAt"`
}
