package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"
	"todo/internal/types"
)

// when logout update data on persistance table
func (tx *Tx) Logout(ctx context.Context, log *types.Logout, pers *types.Persistance) error {
	ctxUpdate, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	query := `
		UPDATE persistance
		SET logout_at = $1
		WHERE user_id = $2 AND token = $3
		RETURNING user_id, token, login_at;
	`

	err := tx.Tx.QueryRow(ctxUpdate, query, pers.LoginAt, log.UserId, log.Token).Scan(&pers.UserId, &pers.Token, &pers.LoginAt)
	if err != nil {
		return fmt.Errorf("logout: %v", err)
	}

	return nil
}

func (tx *Tx) UpdateTodo(ctx context.Context, t *types.Todo) error {
	ctxUpdate, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var dueTime sql.NullTime
	if !t.DueTime.IsZero() || t.DueTime.Compare(time.Now()) >= 1 {
		dueTime = sql.NullTime{Time: t.DueTime, Valid: true}
	} else {
		dueTime = sql.NullTime{Valid: false}
	}

	query := `
		UPDATE todo
		SET content = $1, due_time = $2
		WHERE id = $3
		RETURNING user_id, created_at, due_time, is_plan;
		`
	err := tx.Tx.QueryRow(ctxUpdate, query, t.Content, dueTime, t.Id).Scan(&t.UserId, &t.CreatedAt, &dueTime, &t.IsPlan)
	if err != nil {
		return fmt.Errorf("update todo: %v", err)
	}

	t.DueTime, _ = time.Parse("2006-01-02 15:04", dueTime.Time.Format("2006-01-02 15:04"))

	return nil
}
