package handler

import (
	"log"
	"net/http"
	"todo/internal/exception"
	"todo/internal/helper"
	"todo/internal/types"
)

func (db *DB) ThisIsTemplateHandlerChangeThisBasedOnNeeded(w http.ResponseWriter, r *http.Request) {
	// 1. Handle request body

	// 2. Handle business logic
	tx, err := db.DB.BeginTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	// do query here

	err = tx.CommitTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	// 3. Handle response body
	webRespond := types.WebResponse{
		Code:   http.StatusCreated,
		Status: "StatusCreated",
		Data:   nil, // change here
	}

	err = helper.WriteToResponseBody(w, webRespond)
	if err != nil {
		log.Printf("unable to write to response body: %v", err)
		return
	}
}
