package database

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MatchingProfile struct {
	UserID            string   `db:"user_id"`
	ParentName        string   `db:"parent_name"`
	City              string   `db:"address_city"`
	Languages         []string `db:"languages"`
	PreferredDistance int      `db:"preferred_distance_km"`

	// Child information
	ChildName     string    `db:"child_name"`
	ChildBirthday time.Time `db:"child_birthday"`
	ChildGender   string    `db:"child_gender"`
	Interests     []string  `db:"interests"`
	ActivityLevel string    `db:"activity_level"`
	Limitations   []string  `db:"limitations"`
	Allergies     []string  `db:"allergies"`
	PlayStyles    []string  `db:"play_styles"`
}

// UserMatchingPreferences - user's preferences for matching algorithm
// These weights determine how important each factor is for this specific user: from 0 to 5 (not important - very important)
/*type UserMatchingPreferences struct {
	UserID                string `db:"user_id"`
	InterestsWeight       int    `db:"interests_weight"`
	ActivityLevelWeight   int    `db:"activity_level_weight"`
	LimitationsWeight     int    `db:"limitations_weight"`
	AllergiesWeight       int    `db:"allergies_weight"`
	PlayStylesWeight      int    `db:"play_styles_weight"`
	LocationWeight        int    `db:"location_weight"`
	LanguageWeight        int    `db:"language_weight"`
	MaxAgeDifference      int    `db:"max_age_difference"`
}*/

// Looking for matching. COALESCE to be sure that we get something as a result
func GetMatchingProfile(ctx context.Context, pool *pgxpool.Pool, userID string) (*MatchingProfile, error) {
	const query = `
		SELECT 
			pp.user_id::text,
			COALESCE(pp.name, '') as parent_name,
			COALESCE(pp.address_city, '') as address_city,
			COALESCE(pp.languages, '{}') as languages,
			COALESCE(pp.preferred_distance_km, 0) as preferred_distance_km,
			COALESCE(c.name, '') as child_name,
			COALESCE(c.birthday, now()::date) as child_birthday,
			COALESCE(c.gender, '') as child_gender,
			COALESCE(c.interests, '{}') as interests,
			COALESCE(c.activity_level, '') as activity_level,
			COALESCE(c.limitations, '{}') as limitations,
			COALESCE(c.allergies, '{}') as allergies,
			COALESCE(c.play_styles, '{}') as play_styles
		FROM parent_profiles pp
		JOIN children c ON pp.user_id = c.user_id
		WHERE pp.user_id = $1  
		LIMIT 1` //for 1 parent 1 child

	var profile MatchingProfile
	err := pool.QueryRow(ctx, query, userID).Scan(
		&profile.UserID,
		&profile.ParentName,
		&profile.City,
		&profile.Languages,
		&profile.PreferredDistance,
		&profile.ChildName,
		&profile.ChildBirthday,
		&profile.ChildGender,
		&profile.Interests,
		&profile.ActivityLevel,
		&profile.Limitations,
		&profile.Allergies,
		&profile.PlayStyles,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil // Profile not found
		}
		return nil, err
	}

	return &profile, nil
}

// GetUserMatchingPreferences retrieves user's matching preferences
// If preferences don't exist, creates default ones automatically
/*func GetUserMatchingPreferences(ctx context.Context, pool *pgxpool.Pool, userID string) (*UserMatchingPreferences, error) {
	const query = `
		SELECT user_id::text, interests_weight, activity_level_weight, limitations_weight,
			   allergies_weight, play_styles_weight, location_weight,
			   language_weight, max_age_difference
		FROM user_matching_preferences
		WHERE user_id = $1`

	var prefs UserMatchingPreferences
	err := pool.QueryRow(ctx, query, userID).Scan(
		&prefs.UserID,
		&prefs.InterestsWeight,
		&prefs.ActivityLevelWeight,
		&prefs.LimitationsWeight,
		&prefs.AllergiesWeight,
		&prefs.PlayStylesWeight,
		&prefs.LocationWeight,
		&prefs.LanguageWeight,
		&prefs.MaxAgeDifference,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// Create default preferences if they don't exist
			return createDefaultPreferences(ctx, pool, userID)
		}
		return nil, err
	}

	return &prefs, nil
}

// Called automatically when preferences are not made by user
func createDefaultPreferences(ctx context.Context, pool *pgxpool.Pool, userID string) (*UserMatchingPreferences, error) {
	const query = `
		INSERT INTO user_matching_preferences (user_id)
		VALUES ($1)
		ON CONFLICT (user_id) DO NOTHING
		RETURNING user_id::text, interests_weight, activity_level_weight, limitations_weight,
				  allergies_weight, play_styles_weight, location_weight,
				  language_weight, max_age_difference`

	var prefs UserMatchingPreferences
	err := pool.QueryRow(ctx, query, userID).Scan(
		&prefs.UserID,
		&prefs.InterestsWeight,
		&prefs.ActivityLevelWeight,
		&prefs.LimitationsWeight,
		&prefs.AllergiesWeight,
		&prefs.PlayStylesWeight,
		&prefs.LocationWeight,
		&prefs.LanguageWeight,
		&prefs.MaxAgeDifference,
	)

	return &prefs, err
}*/

// GetPotentialMatches retrieves potential matching candidates for a user
// Excludes already connected users and dismissed recommendations
func GetPotentialMatches(ctx context.Context, pool *pgxpool.Pool, userID string) ([]MatchingProfile, error) {
	const query = `
WITH pf AS (
  -- prefilter: only candidates within viewer's radius & with filled profiles
  SELECT candidate_user_id
  FROM prefilter_candidates_postgis($1::uuid, 200, 0)
)
SELECT 
  pp.user_id::text,
  COALESCE(pp.name, '')                                 AS parent_name,
  COALESCE(pp.address_city, '')                         AS address_city,
  COALESCE(pp.languages, '{}'::text[])             AS languages,
  COALESCE(pp.preferred_distance_km, 0)                 AS preferred_distance_km,
  COALESCE(c.name, '')                                  AS child_name,
  COALESCE(c.birthday, now()::date)                     AS child_birthday,
  COALESCE(c.gender, '')                                AS child_gender,
  COALESCE(c.interests, '{}'::text[])                   AS interests,
  COALESCE(c.activity_level, '')                        AS activity_level,
  COALESCE(c.limitations, '{}'::text[])                 AS limitations,
  COALESCE(c.allergies, '{}'::text[])                   AS allergies,
  COALESCE(c.play_styles, '{}'::text[])                 AS play_styles
FROM pf
JOIN parent_profiles pp ON pp.user_id = pf.candidate_user_id
JOIN children        c  ON c.user_id  = pp.user_id
WHERE pp.user_id <> $1::uuid
;`
	/*AND pp.user_id NOT IN (
	-- Exclude users who are already connected or have pending requests
	SELECT target_user_id FROM connections WHERE requester_user_id = $1 AND status IN ('accepted', 'pending')
	UNION
	SELECT requester_user_id FROM connections WHERE target_user_id = $1 AND status IN ('accepted', 'pending')
	UNION
	-- Exclude users who have been dismissed as recommendations
	SELECT dismissed_user_id FROM dismissed_recommendations WHERE user_id = $1*/

	rows, err := pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var profiles []MatchingProfile
	for rows.Next() {
		var profile MatchingProfile
		err := rows.Scan(
			&profile.UserID,
			&profile.ParentName,
			&profile.City,
			&profile.Languages,
			&profile.PreferredDistance,
			&profile.ChildName,
			&profile.ChildBirthday,
			&profile.ChildGender,
			&profile.Interests,
			&profile.ActivityLevel,
			&profile.Limitations,
			&profile.Allergies,
			&profile.PlayStyles,
		)
		if err != nil {
			continue // Skip profiles with scan errors
		}
		profiles = append(profiles, profile)
	}

	return profiles, nil
}

// UpdateUserMatchingPreferences updates user's matching preferences
// Only updates fields that are provided (not nil) in the input
/*func UpdateUserMatchingPreferences(
	ctx context.Context,
	pool *pgxpool.Pool,
	userID string,
	input *structs.UpdatePreferencesInput,
) error {
	// Build dynamic query to only update provided fields
	sets := []string{"updated_at = NOW()"}
	args := []interface{}{userID}
	argIndex := 2

	//  function to add a field to the update query
	add := func(col string, val interface{}) {
		sets = append(sets, col+" = $"+fmt.Sprintf("%d", argIndex))
		args = append(args, val)
		argIndex++
	}

	// Only add fields that are provided (not nil)
	if input.InterestsWeight != nil {
		add("interests_weight", *input.InterestsWeight)
	}
	if input.ActivityLevelWeight != nil {
		add("activity_level_weight", *input.ActivityLevelWeight)
	}
	if input.LimitationsWeight != nil {
		add("limitations_weight", *input.LimitationsWeight)
	}
	if input.AllergiesWeight != nil {
		add("allergies_weight", *input.AllergiesWeight)
	}
	if input.PlayStylesWeight != nil {
		add("play_styles_weight", *input.PlayStylesWeight)
	}
	if input.LocationWeight != nil {
		add("location_weight", *input.LocationWeight)
	}
	if input.LanguageWeight != nil {
		add("language_weight", *input.LanguageWeight)
	}
	if input.MaxAgeDifference != nil {
		add("max_age_difference", *input.MaxAgeDifference)
	}

	// Build and execute the update query
	query := "UPDATE user_matching_preferences SET " +
			 strings.Join(sets, ", ") +
			 " WHERE user_id = $1"

	_, err := pool.Exec(ctx, query, args...)
	return err
}
*/
