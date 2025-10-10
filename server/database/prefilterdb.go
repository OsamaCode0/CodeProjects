package database

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PrefilterItem struct {
  CandidateID string
  DistanceKm  float64
  City        string
}

func PrefilterWithPostGIS(ctx context.Context, db *pgxpool.Pool, viewer string, limit, offset int) ([]PrefilterItem, error) {
  rows, err := db.Query(ctx,
    `SELECT candidate_user_id, distance_km, address_city
       FROM prefilter_candidates_postgis($1,$2,$3)`,
    viewer, limit, offset)
  if err != nil { return nil, err }
  defer rows.Close()

  out := make([]PrefilterItem, 0, limit)
  for rows.Next() {
    var it PrefilterItem
    if err := rows.Scan(&it.CandidateID, &it.DistanceKm, &it.City); err != nil { return nil, err }
    out = append(out, it)
  }
  return out, rows.Err()
}
