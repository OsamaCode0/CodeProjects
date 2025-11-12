package handler

import (
	"fmt"
	"log"
	"net/http"
	"time"
	"todo/internal/exception"
	"todo/internal/helper"
	"todo/internal/types"
)

func (db *DB) SaveTodo(w http.ResponseWriter, r *http.Request) {
	// 1. Handle request body
	inputTodo := &types.Todo{}
	err := helper.ReadFromRequestBody(r, inputTodo)
	if err != nil {
		exception.HandleBadRequestError(w, fmt.Errorf("save todo handler: %v", err))
		return
	}

	// 2. Handle business logic
	tx, err := db.DB.BeginTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	isExists, err := tx.IsUserExists(r.Context(), inputTodo.UserId)
	if err != nil || !isExists {
		tx.Tx.Rollback(r.Context())
		exception.HandleUnauthorized(w, err)
		return
	}

	timeNow, err := time.Parse("2006-01-02 15:04", time.Now().Format("2006-01-02 15:04"))

	// convert due time to time duration

	todo := &types.Todo{
		UserId:    inputTodo.UserId,
		Content:   inputTodo.Content,
		CreatedAt: timeNow,
		DueTime:   inputTodo.DueTime,
		// IsPlan:    inputTodo.IsPlan, // skip this due to auto generated based on due time input
	}

	err = tx.InsertIntoTableTodo(r.Context(), todo)
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

	// 3. Handle response body
	webRespond := types.WebResponse{
		Code:   http.StatusCreated,
		Status: "StatusCreated",
		Data:   todo, // change here
	}

	err = helper.WriteToResponseBody(w, webRespond)
	if err != nil {
		log.Printf("unable to write to response body: %v", err)
		return
	}
}
