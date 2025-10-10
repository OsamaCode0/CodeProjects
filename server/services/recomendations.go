package services

import (
	"context"
	"matchme-server/database"
	"matchme-server/internal"
	"matchme-server/structs"

	"github.com/gin-gonic/gin"
)

func GetRecommendations(c *gin.Context) {
	userID := c.GetString("userID") 
	limit := 10 // limit of possible matches to show

	ctx := context.Background()

	// Get current user's profile for matching
	currentProfile, err := database.GetMatchingProfile(ctx, internal.DB, userID)
	if err != nil || currentProfile == nil {
		c.JSON(500, structs.ErrorResponse{
			Message: "failed to get user profile",
		})
		return
	}

	// Get current user's matching preferences (weights)
	currentPrefs, err := database.GetUserMatchingPreferences(ctx, internal.DB, userID)
	if err != nil {
		c.JSON(500, structs.ErrorResponse{
			Message: "failed to get user preferences",
		})
		return
	}

	// Get list of potential matching candidates
	candidates, err := database.GetPotentialMatches(ctx, internal.DB, userID)
	if err != nil {
		c.JSON(500, structs.ErrorResponse{
			Message: "failed to get potential matches",
		})
		return
	}

	// Delegate to algorithm service for compatibility calculation
	matches := CalculateMatchingScores(currentProfile, currentPrefs, candidates, ctx)

	// Limit results to requested amount
	if len(matches) > limit {
		matches = matches[:limit]
	}

	// Return only user IDs as required by REST API specification
	var recommendations []gin.H
	for _, match := range matches {
		recommendations = append(recommendations, gin.H{
			"id": match.UserID,
		})
	}

	c.JSON(200, gin.H{
		"recommendations": recommendations,
	})
}

// GetMatchingPreferences handles GET /me/matching-preferences endpoint
// Returns user's current matching weight preferences
func GetMatchingPreferences(c *gin.Context) {
	userID := c.GetString("userID")
	
	prefs, err := database.GetUserMatchingPreferences(c.Request.Context(), internal.DB, userID)
	if err != nil {
		c.JSON(500, structs.ErrorResponse{
			Message: "failed to get preferences",
		})
		return
	}

	c.JSON(200, prefs)
}