package handler

import (
	"fmt"
	"log"
	"net/http"
	"time"
	"todo/internal/exception"
	"todo/internal/helper"
	"todo/internal/types"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func (db *DB) AddTodo(w http.ResponseWriter, r *http.Request) {
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
		Code:   http.StatusOK,
		Status: "StatusOK",
		Data:   todo, // change here
	}

	err = helper.WriteToResponseBody(w, webRespond)
	if err != nil {
		log.Printf("unable to write to response body: %v", err)
		return
	}
}

func (db *DB) UpdateTodo(w http.ResponseWriter, r *http.Request) {
	// 1. Handle request body
	updateTodo := &types.Todo{}
	err := helper.ReadFromRequestBody(r, updateTodo)
	if err != nil {
		exception.HandleBadRequestError(w, fmt.Errorf("update todo handler: %v", err))
		return
	}

	// 2. Handle business logic
	tx, err := db.DB.BeginTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	todo := &types.Todo{
		Id:      updateTodo.Id,
		Content: updateTodo.Content,
		DueTime: updateTodo.DueTime,
	}
	err = tx.UpdateTodo(r.Context(), todo)
	if err != nil {
		tx.Tx.Rollback(r.Context())
		exception.HandleResponseError(w, fmt.Errorf("update todo: %v", err))
		return
	}

	err = tx.CommitTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	// 3. Handle response body
	webRespond := types.WebResponse{
		Code:   http.StatusOK,
		Status: "StatusOK",
		Data:   todo,
	}

	err = helper.WriteToResponseBody(w, webRespond)
	if err != nil {
		log.Printf("unable to write to response body: %v", err)
		return
	}
}

func (db *DB) GetAllTodo(w http.ResponseWriter, r *http.Request) {
	// 1. Handle request body
	vars := mux.Vars(r)
	id := vars["user_id"]
	userIdUUID, err := uuid.Parse(id)
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	// 2. Handle business logic
	tx, err := db.DB.BeginTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	todos := &[]*types.Todo{}
	err = tx.FindTodos(r.Context(), userIdUUID, todos)
	if err != nil {
		tx.Tx.Rollback(r.Context())
		exception.HandleResponseError(w, fmt.Errorf("get all todo: %v", err))
		return
	}

	err = tx.CommitTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	// 3. Handle response body
	webRespond := types.WebResponse{
		Code:   http.StatusOK,
		Status: "StatusOK",
		Data:   todos,
	}

	err = helper.WriteToResponseBody(w, webRespond)
	if err != nil {
		log.Printf("unable to write to response body: %v", err)
		return
	}
}

func (db *DB) DeleteTodo(w http.ResponseWriter, r *http.Request) {
	// 1. Handle request body
	deleteTodo := &types.Todo{}
	err := helper.ReadFromRequestBody(r, deleteTodo)
	if err != nil {
		exception.HandleBadRequestError(w, fmt.Errorf("delete todo handler: %v", err))
		return
	}

	// 2. Handle business logic
	tx, err := db.DB.BeginTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	todo := &types.Todo{
		Id:     deleteTodo.Id,
		UserId: deleteTodo.UserId,
	}
	err = tx.DeleteTodo(r.Context(), todo)
	if err != nil {
		tx.Tx.Rollback(r.Context())
		exception.HandleResponseError(w, fmt.Errorf("delete todo: %v", err))
		return
	}

	err = tx.CommitTransaction()
	if err != nil {
		exception.HandleResponseError(w, err)
		return
	}

	// 3. Handle response body
	webRespond := types.WebResponse{
		Code:   http.StatusOK,
		Status: "StatusOK",
		Data:   todo,
	}

	err = helper.WriteToResponseBody(w, webRespond)
	if err != nil {
		log.Printf("unable to write to response body: %v", err)
		return
	}
}

func (db *DB) SearchTodoByContent(w http.ResponseWriter, r *http.Request) {
	// 1. Handle request body
	vars := mux.Vars(r)
	keyWord := vars["key_word"]
	userId := vars["user_id"]
	userIdUUID, err := uuid.Parse(userId)
	if err != nil {
		exception.HandleBadRequestError(w, fmt.Errorf("user id not found: %v", err))
		return
	}

	// 2. Handle business logic
	tx, err := db.DB.BeginTransaction()
	if err != nil {
		exception.HandleResponseError(w, fmt.Errorf("search todo by content, begin transaction:\n%v", err))
		return
	}

	todos := &[]*types.Todo{}
	err = tx.SearchTodoByContentKeyWord(r.Context(), keyWord, userIdUUID, todos)
	if err != nil {
		tx.Tx.Rollback(r.Context())
		exception.HandleResponseError(w, fmt.Errorf("search todo by content:\n%v", err))
		return
	}

	err = tx.CommitTransaction()
	if err != nil {
		exception.HandleResponseError(w, fmt.Errorf("search todo by content, commit transaction:\n%v", err))
		return
	}

	// 3. Handle response body
	webResponse := &types.WebResponse{
		Code:   http.StatusOK,
		Status: "StatusOk",
		Data:   todos,
	}

	err = helper.WriteToResponseBody(w, webResponse)
	if err != nil {
		log.Printf("unable to write to response body: %v", err)
		return
	}
}
