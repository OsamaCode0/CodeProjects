package structs

//for frontend. that it will always expect same format
type ErrorResponse struct {
	Field string `json:"field,omitempty"`//omitempty, it won’t appear in the JSON if empty
	Message string `json:"message"`

}

type RegisterInput struct {
	Email string `json:"email"`
	Password string `json:"password"`
}