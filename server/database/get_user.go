package database

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func EnsureUserExists(ctx context.Context, pool *pgxpool.Pool, id string) (error, bool) {
	var exists bool
	err := pool.QueryRow(ctx, `SELECT EXISTS (SELECT 1 FROM users WHERE id = $1)`, id).Scan(&exists)
	if err != nil {
		return err, false
	}
	if !exists {
		return nil, false
	}
	return nil, true
}

func GetUserName_photoUrl(ctx context.Context, pool *pgxpool.Pool, id string) (string, string) {
	var name, photo_url string
	err := pool.QueryRow(ctx, `
		SELECT 
			COALESCE(name, '') AS name,
			COALESCE(photo_url, '') AS photo_url
		FROM parent_profiles
		WHERE user_id = $1
		LIMIT 1
	`, id).Scan(&name, &photo_url)

	if err != nil {
		if err == pgx.ErrNoRows {
			// no profile found: return empty values
			return "", ""
		}
		log.Println("name query error:", err)
		return "", ""
	}
	return name, photo_url
}
