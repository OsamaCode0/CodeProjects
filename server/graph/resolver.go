package graph

import (
	"github.com/jackc/pgx/v5/pgxpool"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB *pgxpool.Pool
}

func stringSliceToPtrSlice(s []string) []*string {
	if s == nil {
		return nil
	}
	ptrSlice := make([]*string, len(s))
	for i := range s {
		ptrSlice[i] = &s[i]
	}
	return ptrSlice
}
