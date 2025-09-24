// file for starting the server
package handlers

import (
	"matchme-server/endpoints"
	"matchme-server/internal"
	"matchme-server/middleware"
	"matchme-server/services"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	router.POST("/users/register", services.Register)
	router.POST("/users/login", services.Login)

	router.GET("/users/:id", endpoints.GetUserById)

	
	auth := router.Group("/")
	auth.Use(middleware.AuthRequired(internal.Cfg.JWTSecret))//the func will always run before anything with auth
	auth.PATCH("/me/profile", services.PatchMeProfile)
	auth.PATCH("/me/profile/child", services.PatchMeChild)

	return router
}

//GET  /me/profile
//PATCH /me/profile done
//GET  /users/:id
//GET  /users/:id/profile
//GET  /users/:id/bio
//GET  /recommendations
//GET  /connections
//POST /me/children → add a child

//PATCH /me/children/:childId → update one child

//DELETE /me/children/:childId → remove

//GET /me/children → list (to prefill UI)