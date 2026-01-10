package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type (
	Db struct {
		Db *pgxpool.Pool
	}

	Tx struct {
		Tx pgx.Tx
	}
)

func OpenDB(dsn string) (*Db, error) {
	db, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		return &Db{}, fmt.Errorf("failed to open database connection: %w", err)
	}

	if err := db.Ping(context.Background()); err != nil {
		return &Db{}, fmt.Errorf("failed to ping database: %w", err)
	}

	return &Db{Db: db}, nil
}

func (db *Db) BeginTransaction() (*Tx, error) {
	tx, err := db.Db.Begin(context.Background())
	if err != nil {
		return nil, err
	}

	return &Tx{Tx: tx}, nil
}

func (tx *Tx) CommitTransaction() error {
	ctx, cancle := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancle()

	err := tx.Tx.Commit(ctx) // Commit the transaction
	if err != nil {
		return err
	}
	return nil
}
