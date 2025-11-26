package types

import (
	"time"

	"github.com/google/uuid"
)

type (
	AppUser struct {
		Id           uuid.UUID `json:"id"` // UUID we store as string
		Email        string    `json:"email"`
		Name         string    `json:"name"`
		PasswordHash string    `json:"password_hash"`
	}

	Register struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Name     string `json:"name"`
	}

	Login struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	Logout struct {
		UserId uuid.UUID `json:"user_id"`
		Token  uuid.UUID `json:"token"`
	}

	Connected struct {
		UserA       string    `json:"user_a"` // app_user(id)
		UserB       string    `json:"user_b"` // app_user(id)
		RequestedAt time.Time `json:"requested_at"`
		ConnectedAt time.Time `json:"connected_at"`
		IsRequested bool      `json:"is_requested"`
		IsAccepted  bool      `json:"is_accepted"`
	}

	Todo struct {
		Id        int       `json:"id"`
		UserId    uuid.UUID `json:"user_id"`
		Content   string    `json:"content"`
		CreatedAt time.Time `json:"created_at"`
		DueTime   time.Time `json:"due_time"`
		IsPlan    bool      `json:"is_plan"`
	}

	Archive struct {
		TodoId      int       `json:"todo_id"`
		UserId      uuid.UUID `json:"user_id"`
		Content     string    `json:"content"`
		CreatedAt   time.Time `json:"created_at"`
		DueTime     time.Time `json:"due_time"`
		IsPlan      bool      `json:"is_plan"`
		CompletedAt time.Time `json:"completed_at"`
	}

	Chat struct {
		Id          int       `json:"id"`
		SenderId    uuid.UUID `json:"sender_id"`
		RecipientId uuid.UUID `json:"recipient_id"`
		Content     string    `json:"content"`
		IsRead      string    `json:"is_read"`
	}

	Persistance struct {
		UserId   uuid.UUID `json:"user_id"`
		Token    uuid.UUID `json:"token"`
		LoginAt  time.Time `json:"login_at"`
		LogoutAt time.Time `json:"logout_at"`
	}
)
