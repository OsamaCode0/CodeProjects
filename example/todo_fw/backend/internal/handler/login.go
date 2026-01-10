package handler

import (
	"log"
	"net/http"
	"time"
	"todo/internal/exception"
	"todo/internal/helper"
	"todo/internal/types"

	"github.com/google/uuid"
)

func (db *DB) LoginUser(w http.ResponseWriter, r *http.Request) {
	// 1. handle request body
	logs := &types.Login{}
	err := helper.ReadFromRequestBody(r, logs)
	if err != nil {
		exception.HandleBadRequestError(w, err)
		return
	}

	// 2. handle business logic
	tx, err := db.DB.BeginTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}
	timeNow, _ := time.Parse("2006-01-02 15:04", time.Now().Format("2006-01-02 15:04"))

	pers := &types.Persistance{
		LoginAt: timeNow,
	}
	err = tx.Login(r.Context(), logs, pers)
	if err != nil {
		tx.Tx.Rollback(r.Context())
		exception.HandleResponseError(w, err)
		return
	}

	user := &types.AppUser{
		Id: pers.UserId,
	}
	err = tx.FindUserById(r.Context(), user)
	if err != nil {
		tx.Tx.Rollback(r.Context())
		exception.HandleResponseError(w, err)
		return
	}

	err = tx.CommitTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	// 3. handle response
	webRespond := types.WebResponse{
		Code:   http.StatusAccepted,
		Status: "StatusAccepted",
		Data: struct {
			UserId   uuid.UUID `json:"user_id"`
			Token    uuid.UUID `json:"token"`
			LoginAt  time.Time `json:"login_at"`
			LogoutAt time.Time `json:"logout_at"`
			Email    string    `json:"email"`
			Name     string    `json:"name"`
		}{
			UserId:   pers.UserId,
			Token:    pers.Token,
			LoginAt:  pers.LoginAt,
			LogoutAt: pers.LogoutAt,
			Email:    user.Email,
			Name:     user.Name,
		},
	}

	err = helper.WriteToResponseBody(w, webRespond)
	if err != nil {
		log.Printf("unable to write to response body: %v", err)
		return
	}
}

func (db *DB) LogoutUser(w http.ResponseWriter, r *http.Request) {
	// 1. handle request body
	logs := &types.Logout{}
	err := helper.ReadFromRequestBody(r, logs)
	if err != nil {
		exception.HandleBadRequestError(w, err)
		return
	}

	// 2. handle business logic
	tx, err := db.DB.BeginTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}
	timeNow, _ := time.Parse("2006-01-02 15:04", time.Now().Format("2006-01-02 15:04"))

	pers := &types.Persistance{
		LogoutAt: timeNow,
	}
	err = tx.Logout(r.Context(), logs, pers)
	if err != nil {
		tx.Tx.Rollback(r.Context())
		exception.HandleResponseError(w, err)
		return
	}

	err = tx.CommitTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	// 3. handle response
	webRespond := types.WebResponse{
		Code:   http.StatusOK,
		Status: "StatusOK",
		Data:   pers,
	}

	err = helper.WriteToResponseBody(w, webRespond)
	if err != nil {
		log.Printf("unable to write to response body: %v", err)
		return
	}
}
