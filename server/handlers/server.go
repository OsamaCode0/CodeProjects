// file for starting the server
package handlers

import (
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

	
	auth := router.Group("/")
	auth.Use(middleware.RequireSession())//the func will always run before anything with auth
	auth.GET("/me/debug", services.PatchMeProfile)

	return router
}

//GET  /me/profile
//PATCH /me/profile
//GET  /users/:id
//GET  /users/:id/profile
//GET  /users/:id/bio
//GET  /recommendations
//GET  /connections
//POST /me/children → add a child

//PATCH /me/children/:childId → update one child

//DELETE /me/children/:childId → remove

//GET /me/children → list (to prefill UI)