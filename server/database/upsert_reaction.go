package database

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Reaction string

const (
	ReactionLike    Reaction = "like"
	ReactionDislike Reaction = "dislike"
)

// UpsertReactionAndMaybeMatch upserts viewer's reaction to target
// and, if it's a "like", checkslike and creates a match.
// Returns (isMatch, error).
func UpsertReaction(ctx context.Context, db *pgxpool.Pool, viewerID, targetID string, reaction Reaction) (bool, error) {
	// block self-reaction
	if viewerID == targetID {
		return false, nil
	}

	//  a transaction so the sequence is atomic.
	tx, err := db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return false, err
	}
	defer func() {
		// rollback if not already committed
		_ = tx.Rollback(ctx)
	}()

	// 1) Upsert reaction
	_, err = tx.Exec(ctx, `
		INSERT INTO user_reactions (user_id, target_user_id, reaction)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, target_user_id)
		DO UPDATE SET reaction = EXCLUDED.reaction
	`, viewerID, targetID, string(reaction))
	if err != nil {
		return false, err
	}

	isMatch := false

	// 2) If like, create match 
	if reaction == ReactionLike {
		var exists bool
		err = tx.QueryRow(ctx, `
			SELECT EXISTS (
			  SELECT 1
			  FROM user_reactions
			  WHERE user_id = $1
			    AND target_user_id = $2
			    AND reaction = 'like'
			)
		`, targetID, viewerID).Scan(&exists)
		if err != nil {
			return false, err
		}

		if exists {
			// Insert unique pair (user_a <= user_b)
			_, err = tx.Exec(ctx, `
				INSERT INTO matches (user_a, user_b)
				VALUES (LEAST($1, $2), GREATEST($1, $2))
				ON CONFLICT DO NOTHING
			`, viewerID, targetID)
			if err != nil {
				return false, err
			}
			isMatch = true
		}
	}

	// 3) Commit
	if err := tx.Commit(ctx); err != nil {
		return false, err
	}

	return isMatch, nil
}
