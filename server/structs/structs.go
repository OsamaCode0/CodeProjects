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

type ParentProfile struct {
    UserID             string    `db:"user_id" json:"userId"`
    Name               string    `db:"name" json:"name"`
    Gender             *string   `db:"gender" json:"gender,omitempty"`
    About              *string   `db:"about" json:"about,omitempty"`
    LanguageCodes      []string  `db:"language_codes" json:"languageCodes"`
    AddressCity        *string   `db:"address_city" json:"addressCity,omitempty"`
    PreferredDistance  *int      `db:"preferred_distance_km" json:"preferredDistanceKm,omitempty"`
    CreatedAt          time.Time `db:"created_at" json:"createdAt"`
    UpdatedAt          time.Time `db:"updated_at" json:"updatedAt"`
}
