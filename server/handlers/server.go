// file for starting the server
package handlers

import (
	"fmt"
	"matchme-server/endpoints"
	"matchme-server/graphsetup"
	"matchme-server/internal"
	"matchme-server/middleware"
	"matchme-server/services"
	"regexp"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func setupGraphQL(router gin.IRouter, IsDevMode bool, db *pgxpool.Pool) {
	// This function registers /graphql and /playground
	graphsetup.RegisterGraphQL(router, IsDevMode, db)
}

func SetupRouter(IsDevMode bool, db *pgxpool.Pool) *gin.Engine {

	if !IsDevMode {
		gin.SetMode(gin.ReleaseMode)
	}

	//router := gin.Default()
	router := gin.New()
	router.Use(gin.Recovery())

	tokenRegex := regexp.MustCompile(`token=[^&\s]+`)

	router.Use(gin.LoggerWithConfig(gin.LoggerConfig{
		Formatter: func(param gin.LogFormatterParams) string {
			path := param.Request.URL.Path
			query := param.Request.URL.RawQuery

			fullPath := path
			if query != "" {
				fullPath = path + "?" + query
			}

			sanitizedPath := tokenRegex.ReplaceAllString(fullPath, "token=[REDACTED]")

			return fmt.Sprintf("[GIN] %v | %3d | %13v | %15s | %-7s %s\n",
				param.TimeStamp.Format("2006/01/02 - 15:04:05"),
				param.StatusCode,
				param.Latency,
				param.ClientIP,
				param.Method,
				sanitizedPath,
			)
		},
	}))

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowWildcard:    false,
		MaxAge:           12 * time.Hour,
	}))
	//router.Use(gin.Logger())
	//router.Use(gin.Recovery())

	//to check that REST is working
	router.GET("/rest/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong!"})
	})

	gqlGroup := router.Group("/") // You can use / or /graphql
	gqlGroup.Use(middleware.GinGqlAuthMiddleware(internal.Cfg.JWTSecret))
	setupGraphQL(gqlGroup, IsDevMode, db)


	router.POST("/users/register", services.Register)
	router.POST("/users/login", services.Login)

	router.GET("/ws", HandleWebSocket(GlobalHub))

	auth := router.Group("/")
	auth.Use(middleware.AuthRequired(internal.Cfg.JWTSecret))
	auth.GET("/users/:id", endpoints.GetNameAndPhoto)
	auth.GET("/users/:id/profile", endpoints.GetUserProfileByID)
	auth.GET("/users/:id/bio", endpoints.GetUserBioByID)

	auth.PATCH("/me/profile", services.PatchMeProfile)
	auth.PATCH("/me/child", services.PatchMeChild)

	auth.GET("/me", endpoints.GetMeNameAndPhoto)
	auth.GET("/me/profile", endpoints.GetMyProfile)
	auth.GET("/me/bio", endpoints.GetMeBio)
	auth.GET("/me/child", endpoints.GetChildProfile)
	auth.GET("/me/cloudinary-sign", endpoints.CloudinarySign)
	auth.GET("/me/email", endpoints.GetMyEmail)

	auth.POST("/me/photo", endpoints.PostMePhoto)
	auth.DELETE("/me/photo", endpoints.DeleteMePhoto)
	auth.POST("/recommendations/:targetUserId/reaction", endpoints.PostReaction)
	auth.POST("/connections/:connectionId/action", endpoints.PostConnectionAction)
	auth.POST("/api/disconnect", endpoints.PostDisconnect)

	auth.GET("/recommendations", services.GetRecommendations)
	auth.GET("/connections/requests", services.GetRequests)
	auth.GET("/connections", services.GetConnections)

	return router
}
