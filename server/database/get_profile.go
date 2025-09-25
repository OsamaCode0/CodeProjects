package database

import (
	"context"
	"errors"
	"matchme-server/structs"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func GetUserProfile(ctx context.Context, pool *pgxpool.Pool, id string) (*structs.ParentProfile, error){
	var p structs.ParentProfile
	row := pool.QueryRow(ctx, `
        SELECT 
            user_id::text,
            COALESCE(name, '') AS name,
            COALESCE(gender, '') AS gender,
            COALESCE(about, '') AS about,
            COALESCE(language_codes, '{}'::text[]) AS language_codes,
            COALESCE(address_city, '') AS address_city,
            COALESCE(preferred_distance_km, 0) AS preferred_distance_km
        FROM parent_profiles
        WHERE user_id = $1
        LIMIT 1`, id)

    err := row.Scan(
        &p.UserID,
        &p.Name,
        &p.Gender,
        &p.About,
        &p.LanguageCodes,
        &p.AddressCity,
        &p.PreferredDistance,
    )
    if err != nil {
        if errors.Is(err, pgx.ErrNoRows) {
            return nil, nil //not found
        }
        return nil, err
    }

    return &p, nil
}

func GetChildProfile(ctx context.Context, pool *pgxpool.Pool, id string) (*structs.Child, error){
	var c structs.Child
	row := pool.QueryRow(ctx, `
        SELECT 
            user_id::text,
            COALESCE(name, '') AS name,
            COALESCE(birthday, now()::date) AS birthday,
            COALESCE(gender, '') AS gender,
            COALESCE(about_short, '') AS about_short,
            COALESCE(interests, '{}'::text[]) AS interests,
            COALESCE(activity_level, '') AS activity_level,
            COALESCE(limitations, '{}'::text[]) AS limitations,
            COALESCE(allergies, '{}'::text[]) AS allergies,
            COALESCE(play_styles, '{}'::text[]) AS play_styles
        FROM children
        WHERE user_id = $1
        LIMIT 1`, id)
	
    err := row.Scan(
        &c.UserID,
        &c.Name,
		&c.Birthday,
        &c.Gender,
        &c.About_short,
        &c.Interests,
        &c.Activity_level,
        &c.Limitations,
		&c.Allergies,
		&c.Play_styles,
    )
    if err != nil {
        if errors.Is(err, pgx.ErrNoRows) {
            return nil, nil //not found
        }
        return nil, err
    }

    return &c, nil
}