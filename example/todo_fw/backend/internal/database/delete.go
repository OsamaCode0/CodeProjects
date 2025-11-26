package database

import (
	"context"
	"fmt"
	"time"
	"todo/internal/types"
)

func (tx *Tx) DeleteTodo(ctx context.Context, t *types.Todo) error {
	ctxDelete, cancle := context.WithTimeout(ctx, 3*time.Second)
	defer cancle()

	query := `
		DELETE FROM todo
		WHERE id = $1 AND user_id = $2
	`

	_, err := tx.Tx.Exec(ctxDelete, query, t.Id, t.UserId)
	if err != nil {
		return fmt.Errorf("delete todo: %v", err)
	}

	return nil
}
