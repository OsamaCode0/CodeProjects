// file for starting the server
package internal

import (
	"log"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	router.POST("/users/register", Register)
	router.POST("/users/login", Login)

	return router
}

func StartServer(){
	LoadConfig()
	err := ConnectDB()

	if err != nil {
		log.Println(err)
	}

	defer DB.Close()

	router := SetupRouter()
	router.Run(":" + Cfg.Port)
}