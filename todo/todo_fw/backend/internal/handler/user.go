package handler

import (
	"log"
	"net/http"
	"todo/internal/exception"
	"todo/internal/helper"
	"todo/internal/types"

	"github.com/gorilla/mux"
)

func (db *DB) FindUserById(w http.ResponseWriter, r *http.Request) {
	// 1. handle request body
	vars := mux.Vars(r)
	id := vars["id"]
	tap := &types.AppUser{
		Id: id,
	}

	// 2. handle business logic
	tx, err := db.DB.BeginTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	err = tx.FindUserById(r.Context(), tap)
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

	// 3. handle response body
	webRespond := types.WebResponse{
		Code:   http.StatusCreated,
		Status: "StatusCreated",
		Data:   tap,
	}

	err = helper.WriteToResponseBody(w, webRespond)
	if err != nil {
		log.Printf("unable to write to response body: %v", err)
		return
	}
}
