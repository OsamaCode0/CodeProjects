// file for connecting db
package server

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func ConnectDB() (*pgxpool.Pool, error){
	pool, err := pgxpool.New(context.Background(), Cfg.DatabaseURL)	
	 if err != nil {
		log.Println("Can't connect to a DB", err)
        return nil, err
    }
	log.Println("DB connected")
    return pool, nil
}