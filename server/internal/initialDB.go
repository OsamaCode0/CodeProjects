package internal

import (
	"context" 
	"fmt"
	"log"
	"os"
)

// InitializeDB reads and executes the schema.sql file to set up the database.
func InitializeDB() error {
	// Read the SQL file
	sqlBytes, err := os.ReadFile("schema.sql")
	if err != nil {
		return fmt.Errorf("could not read schema.sql file: %w", err)
	}


	_, err = DB.Exec(context.Background(), string(sqlBytes))
	if err != nil {
		return fmt.Errorf("could not execute schema.sql script: %w", err)
	}

	log.Println("Database schema initialized successfully.")
	return nil
}