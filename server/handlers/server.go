// file for starting the server
package handlers

import (
	"matchme-server/endpoints"
	"matchme-server/internal"
	"matchme-server/middleware"
	"matchme-server/services"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowWildcard:    false,
		MaxAge:           12 * time.Hour,
	}))
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	router.POST("/users/register", services.Register)
	router.POST("/users/login", services.Login)

	router.GET("/users/:id", endpoints.GetNameAndPhoto)
	router.GET("/users/:id/profile", endpoints.GetUserProfileByID)
	router.GET("/users/:id/bio", endpoints.GetUserBioByID)

	// WebSocket endpoint (БЕЗ middleware - проверка токена внутри handler)
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

	auth.GET("/me/email", endpoints.GetMyEmail) //e-mail for user
	
	// Chat endpoints
	auth.GET("/api/chats", GetUserChats)
	auth.GET("/api/chats/:chatId/messages", GetChatMessages)
	auth.GET("/users/:id/online", CheckOnlineStatus) 
	auth.POST("/api/chats/:chatId/messages", SendMessage)
	auth.POST("/api/chats/:chatId/read", MarkMessagesAsRead)
	


	auth.POST("/me/photo", endpoints.PostMePhoto)
	auth.DELETE("/me/photo", endpoints.DeleteMePhoto)
	auth.POST("/recommendations/:targetUserId/reaction", endpoints.PostReaction)
	auth.POST("/connections/requests/:targetUserId/reaction", endpoints.PostReaction)
	auth.POST("/api/disconnect", endpoints.PostDisconnect)

	// For matching
	auth.GET("/recommendations", services.GetRecommendations)
	auth.GET("/connections/requests", services.GetRequests)
	auth.GET("/connections", services.GetConnections)

	return router
}