// file for starting the server
package handlers

import (
	"fmt"
	"matchme-server/endpoints"
	"matchme-server/internal"
	"matchme-server/middleware"
	"matchme-server/services"
	"regexp"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
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

	router.POST("/users/register", services.Register)
	router.POST("/users/login", services.Login)

	router.GET("/users/:id", endpoints.GetNameAndPhoto)
	router.GET("/users/:id/profile", endpoints.GetUserProfileByID)
	router.GET("/users/:id/bio", endpoints.GetUserBioByID)

	router.GET("/ws", HandleWebSocket(GlobalHub))

	auth := router.Group("/")
	auth.Use(middleware.AuthRequired(internal.Cfg.JWTSecret))
	auth.PATCH("/me/profile", services.PatchMeProfile)
	auth.PATCH("/me/child", services.PatchMeChild)

	auth.GET("/me", endpoints.GetMeNameAndPhoto)
	auth.GET("/me/profile", endpoints.GetMyProfile)
	auth.GET("/me/bio", endpoints.GetMeBio)
	auth.GET("/me/child", endpoints.GetChildProfile)
	auth.GET("/me/cloudinary-sign", endpoints.CloudinarySign)

	auth.GET("/me/email", endpoints.GetMyEmail)
	
	auth.GET("/api/chats", GetUserChats)
	auth.GET("/api/chats/:chatId/messages", GetChatMessages)
	auth.GET("/users/:id/online", CheckOnlineStatus)
	auth.POST("/api/chats/:chatId/messages", SendMessage)
	auth.POST("/api/chats/:chatId/read", MarkMessagesAsRead)

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