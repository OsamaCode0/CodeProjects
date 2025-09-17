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

	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{"status":"ok"})
	})

	router.POST("/users", Register)

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