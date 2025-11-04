// auth_mw.go
package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)
// A private key type to prevent context key collisions
type contextKey string

const userIDKey = contextKey("userID")

// AuthRequired is a middleware that checks for a valid JWT in the Authorization header.
// It expects the header in the form: "Authorization: Bearer <token>".
// If the token is valid, it puts the user ID into Gin's context (c.Set("userID", ...)).
// Otherwise, it aborts the request with HTTP 401 Unauthorized.
func AuthRequired(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
    // Get the Authorization header from the request
		auth := c.GetHeader("Authorization")
    // Check if the header starts with "Bearer " (the required format)
		if !strings.HasPrefix(auth, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "missing bearer token"})
			return
		}
    // Strip the "Bearer " prefix, leaving only the token string
		tokenStr := strings.TrimPrefix(auth, "Bearer ")

    // Parse the token and validate its claims
		// - Pass an empty RegisteredClaims struct to bind claims into
		// - The key function checks that the token was signed with HMAC
		//   and returns the secret used for verification
		token, err := jwt.ParseWithClaims(tokenStr, &jwt.RegisteredClaims{}, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return []byte(secret), nil
		})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "invalid token"})
			return
		}

		claims, ok := token.Claims.(*jwt.RegisteredClaims)
		if !ok || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "invalid claims"})
			return
		}

		// Save the user ID (subject claim) in the Gin context
		// This makes it accessible in later handlers with c.GetString("userID")
		userID := claims.Subject
		c.Set("userID", userID)

		//for GRAPH
		ctx := context.WithValue(c.Request.Context(), userIDKey, userID)
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}

func GinGqlAuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			c.Next() // No token, but that's okay
			return
		}

		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		token, err := jwt.ParseWithClaims(tokenStr, &jwt.RegisteredClaims{}, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return []byte(secret), nil
		})
		if err != nil {
			c.Next() // Invalid token, but that's okay.
			return
		}

		claims, ok := token.Claims.(*jwt.RegisteredClaims)
		if !ok || !token.Valid {
			c.Next() // Invalid claims, but that's okay.
			return
		}

		// Token is valid! Add the userID to the context.
		userID := claims.Subject
		c.Set("userID", userID) // For Gin
		ctx := context.WithValue(c.Request.Context(), userIDKey, userID) // For GQLGEN
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}

func GetUserIDFromContext(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(userIDKey).(string)
	return userID, ok
}
