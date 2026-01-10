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

	// Use pers.LogoutAt as the logout time parameter
	err := tx.Tx.QueryRow(ctxUpdate, query, pers.LogoutAt, log.UserId, log.Token).Scan(&pers.UserId, &pers.Token, &pers.LoginAt)
	if err != nil {
		return fmt.Errorf("logout: %v", err)
	}

	return nil
}

func (tx *Tx) UpdateTodo(ctx context.Context, t *types.Todo) error {
	ctxUpdate, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var dueTime sql.NullTime
	if !t.DueTime.IsZero() {
		dueTime = sql.NullTime{Time: t.DueTime, Valid: true}
	} else {
		dueTime = sql.NullTime{Valid: false}
	}

	var reminderTime sql.NullTime
	if !t.ReminderTime.IsZero() {
		reminderTime = sql.NullTime{Time: t.ReminderTime, Valid: true}
	} else {
		reminderTime = sql.NullTime{Valid: false}
	}

	query := `
		UPDATE todo
		SET content = $1, due_time = $2, reminder_time = $3
		WHERE id = $4
		RETURNING user_id, created_at, due_time, reminder_time, is_plan;
		`
	err := tx.Tx.QueryRow(ctxUpdate, query, t.Content, dueTime, reminderTime, t.Id).Scan(&t.UserId, &t.CreatedAt, &dueTime, &reminderTime, &t.IsPlan)
	if err != nil {
		return fmt.Errorf("update todo: %v", err)
	}

	// Assign parsed times back to struct (zero time if invalid)
	if dueTime.Valid {
		t.DueTime = dueTime.Time
	} else {
		t.DueTime = time.Time{}
	}
	if reminderTime.Valid {
		t.ReminderTime = reminderTime.Time
	} else {
		t.ReminderTime = time.Time{}
	}

	return nil
}
