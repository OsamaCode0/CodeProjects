package database

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// CreateUser inserts a new user and returns its id + created_at.
func CreateUser(ctx context.Context, pool *pgxpool.Pool, email, hashedPassword string) (string, time.Time, error) {
	const q = `
		INSERT INTO users (id, email, password_hash, created_at)
		VALUES (uuid_generate_v4(), $1, $2, NOW())
		RETURNING id, created_at
	`

	var (
		id        string
		createdAt time.Time
	)
	err := pool.QueryRow(ctx, q, email, hashedPassword).Scan(&id, &createdAt)
	if err != nil {
		return "", time.Time{}, err
	}
	return id, createdAt, nil
}


// for login
func GetUserByEmail(ctx context.Context, pool *pgxpool.Pool, email string) (string, string, error) {
	const q = `SELECT id, password_hash FROM users WHERE email=$1`

	var (
		id     string
		pwHash string
	)

	err := pool.QueryRow(ctx, q, email).Scan(&id, &pwHash)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", "", pgx.ErrNoRows
		}
		return "", "", err
	}

	return id, pwHash, nil
}