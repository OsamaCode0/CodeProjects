package handler

import (
	"log"
	"net/http"
	"todo/internal/database"
	"todo/internal/exception"
	"todo/internal/helper"
	"todo/internal/types"
)

type DB struct {
	DB *database.Db
}

func (db *DB) RegisterUser(w http.ResponseWriter, r *http.Request) {
	// 1. handle request body
	reg := &types.Register{}
	err := helper.ReadFromRequestBody(r, reg)
	if err != nil {
		exception.HandleBadRequestError(w, err)
		return
	}

	// 2. handle business logic (service layer)
	tx, err := db.DB.BeginTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	regUser := &types.AppUser{}
	err = tx.RegisteringNewUser(r.Context(), reg, regUser)
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
		Code:   http.StatusCreated,
		Status: "StatusCreated",
		Data:   regUser,
	}

	err = helper.WriteToResponseBody(w, webRespond)
	if err != nil {
		log.Printf("unable to write to response body: %v", err)
		return
	}
}
