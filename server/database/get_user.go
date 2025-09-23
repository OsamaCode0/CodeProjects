package database

import (
	"context"
	"log"

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
	err := pool.QueryRow(ctx, `SELECT COALESCE(
   (SELECT name FROM parent_profiles WHERE user_id = $1 LIMIT 1), ''
   )`, id).Scan(&name)
	if err != nil {
		log.Println("name querry: ", err)
		name = ""
	}

	err = pool.QueryRow(ctx, `SELECT
   (SELECT url FROM user_photos WHERE user_id = $2 AND is_main = TRUE LIMIT 1)
   `, id).Scan(&photo_url)
	if err != nil {
		log.Println("url querry: ", err)
		photo_url = ""
	}
	return name, photo_url
}
 
