// file for starting the server
package handlers

import (
	"github.com/gin-gonic/gin"
	"matchme-server/services"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	router.POST("/users/register", services.Register)
	router.POST("/users/login", services.Login)

	return router
}

//GET  /me/profile
//PATCH /me/profile
//GET  /users/:id
//GET  /users/:id/profile
//GET  /users/:id/bio
//GET  /recommendations
//GET  /connections
