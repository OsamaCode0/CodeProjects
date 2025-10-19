package database

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GetConnections(ctx context.Context, pool *pgxpool.Pool, userID string) ([]string, error) {
	const query = `
	SELECT ur.user_id
FROM user_reactions ur
WHERE ur.target_user_id = $1
  AND ur.is_match = true
  ;`

  rows, err := pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var connections []string
	for rows.Next(){
		var connection string
		rows.Scan(&connection)
		connections = append(connections, connection)
	}
	
	return connections, nil
}
