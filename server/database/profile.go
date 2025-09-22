package database

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)
var ErrParentProfileNotFound = errors.New("parent profile not found")
// EnsureParentProfile inserts a row for userID if it doesn't exist.
func EnsureParentProfile(ctx context.Context, pool *pgxpool.Pool, userID string) error {
	const q = `
		INSERT INTO parent_profiles (user_id)
		VALUES ($1)
		ON CONFLICT (user_id) DO NOTHING
	`
	_, err := pool.Exec(ctx, q, userID)
	return err
}

// UpdateParentProfileDynamic updates with prebuilt SET clauses and args,
// and returns a map keyed by the RETURNING column names.
// args MUST start with userID as $1, and SET placeholders must start at $2.
func UpdateParentProfileDynamic(
	ctx context.Context,
	pool *pgxpool.Pool,
	sets []string,
	args []any,
	returningCols []string,
) (map[string]any, error) {

	// return user_id as text with a stable key
	ret := make([]string, 0, len(returningCols)+1)
	ret = append(ret, `user_id::text AS user_id`)
	ret = append(ret, returningCols...)

	q := fmt.Sprintf(`
		UPDATE parent_profiles
		SET %s
		WHERE user_id = $1
		RETURNING %s`,
		strings.Join(sets, ", "),
		strings.Join(ret, ", "),
	)

	rows, err := pool.Query(ctx, q, args...)
	if err != nil {
		return nil, fmt.Errorf("update parent_profiles: %w", err)
	}
	defer rows.Close()

	m, err := pgx.CollectOneRow(rows, pgx.RowToMap)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrParentProfileNotFound
		}
		return nil, fmt.Errorf("scan parent_profiles: %w", err)
	}
	return m, nil
}
