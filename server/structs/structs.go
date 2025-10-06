package structs

import (
	"time"
)

// for frontend. that it will always expect same format
type ErrorResponse struct {
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


type ParentProfile struct {
	UserID            string    `json:"userId"`
	Name              string    `json:"name"`
	Gender            string    `json:"gender"`
	About             string    `json:"about,omitempty"`
	LanguageCodes     []string  `json:"languages"`
	AddressCity       string    `json:"addressCity,omitempty"`
	Lat               float64   `json:"lat,omitempty"`
	Lon               float64   `json:"lon,omitempty"`
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

type UserPhoto struct {
    UserID  string     `db:"user_id"`
    PublicID string    `db:"photo_public_id"`
    Version  int       `db:"photo_version"`
}