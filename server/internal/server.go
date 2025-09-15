//file for starting the server
package server

import "github.com/gin-gonic/gin"

func SetupRouter() *gin.Engine {
	router := gin.Default()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{"status":"ok"})
	})

	return router
}

func StartServer(){
	LoadConfig()
	ConnectDB()
	router := SetupRouter()
	router.Run(":" + Cfg.Port)
}