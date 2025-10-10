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
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	router.Use(gin.Logger())
	router.Use(gin.Recovery())


	router.POST("/users/register", services.Register)
	router.POST("/users/login", services.Login)

	router.GET("/users/:id", endpoints.GetNameAndPhoto)
	router.GET("/users/:id/profile", endpoints.GetUserProfileByID)
	router.GET("/users/:id/bio", endpoints.GetUserBioByID)

	auth := router.Group("/")
	auth.Use(middleware.AuthRequired(internal.Cfg.JWTSecret)) //the func will always run before anything with auth
	auth.PATCH("/me/profile", services.PatchMeProfile)
	auth.PATCH("/me/child", services.PatchMeChild)
	auth.GET("/me", endpoints.GetMeNameAndPhoto)
	auth.GET("/me/profile", endpoints.GetMyProfile)
	auth.GET("/me/bio", endpoints.GetMeBio)
	auth.GET("/me/child", endpoints.GetChildProfile)
	auth.GET("/me/cloudinary-sign", endpoints.CloudinarySign)
	auth.POST("/me/photo", endpoints.PostMePhoto)
	auth.DELETE("/me/photo", endpoints.DeleteMePhoto)

	//for matching
	auth.GET("/recomendations", services.GetRecommendations)

	return router
}

//GET  /recommendations
//GET  /connections
//DELETE /me/child
//DELETE /me/profile
