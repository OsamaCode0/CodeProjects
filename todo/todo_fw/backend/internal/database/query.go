package database

import (
	"context"
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

func (tx *Tx) IsUserExists(ctx context.Context, user_id string) (bool, error) {
	var isExists bool

	userIdUUID, err := uuid.Parse(user_id)
	if err != nil {
		return isExists, fmt.Errorf("parse userid to uuid: %v", err)
	}

	ctxIsExisted, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	query := `SELECT is_user_exist($1)`

	err = tx.Tx.QueryRow(ctxIsExisted, query, userIdUUID).Scan(&isExists)
	if err != nil {
		return isExists, fmt.Errorf("query user: %v", err)
	}

	return isExists, nil
}
