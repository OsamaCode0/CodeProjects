package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"
	"todo/internal/types"

	"github.com/google/uuid"
)

func (tx *Tx) FindUserById(ctx context.Context, tap *types.AppUser) error {
	ctxFind, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	query := `
		SELECT email, name FROM app_user
		WHERE id = $1
	`

	err := tx.Tx.QueryRow(ctxFind, query, tap.Id).Scan(&tap.Email, &tap.Name)
	if err != nil {
		return fmt.Errorf("query user: %v", err)
	}

	return nil
}

func (tx *Tx) IsUserExists(ctx context.Context, user_id uuid.UUID) (bool, error) {
	var isExists bool

	ctxIsExisted, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	query := `SELECT is_user_exist($1)`

	err := tx.Tx.QueryRow(ctxIsExisted, query, user_id).Scan(&isExists)
	if err != nil {
		return isExists, fmt.Errorf("query user: %v", err)
	}

	return isExists, nil
}

func (tx *Tx) FindTodos(ctx context.Context, user_id uuid.UUID, todos *[]*types.Todo) error {
	ctxFind, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	query := `
		SELECT id, user_id, content, created_at, due_time, is_plan FROM todo
		WHERE user_id = $1;
	`

	rows, err := tx.Tx.Query(ctxFind, query, user_id)
	if err != nil {
		return fmt.Errorf("query todo: %v", err)
	}

	for rows.Next() {
		var dueTime sql.NullTime
		t := &types.Todo{}
		err := rows.Scan(&t.Id, &t.UserId, &t.Content, &t.CreatedAt, &dueTime, &t.IsPlan)
		if err != nil {
			return fmt.Errorf("scan todo: %v", err)
		}
		t.DueTime, _ = time.Parse("2006-01-02 15:04", dueTime.Time.Format("2006-01-02 15:04"))

		*todos = append(*todos, t)
	}

	return nil
}

func (tx *Tx) SearchTodoByContentKeyWord(ctx context.Context, keyWord string, userId uuid.UUID, todosOut *[]*types.Todo) error {
	ctxSearch, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	query := `
		SELECT id, user_id, content, created_at, due_time, is_plan FROM todo
		WHERE content ILIKE $1 AND user_id = $2
	`

	rows, err := tx.Tx.Query(ctxSearch, query, fmt.Sprintf("%s%s%s", "%", keyWord, "%"), userId)
	if err != nil {
		return fmt.Errorf("query search todo by content's keyword: %v", err)
	}

	for rows.Next() {
		todo := &types.Todo{}
		dueTime := sql.NullTime{}
		err = rows.Scan(&todo.Id, &todo.UserId, &todo.Content, &todo.CreatedAt, &dueTime, &todo.IsPlan)
		if err != nil {
			return fmt.Errorf("scan search todo by content's keyword: %v", err)
		}

		todo.DueTime = dueTime.Time

		*todosOut = append(*todosOut, todo)
	}

	return nil
}
