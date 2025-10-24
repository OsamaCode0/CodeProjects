package main

import (
	"log"
	"matchme-server/handlers"
	"matchme-server/internal"
)

func main() {
	internal.LoadConfig()
	err := internal.ConnectDB()

	if err != nil {
		log.Println(err)
	}

	defer internal.DB.Close()

	router := handlers.SetupRouter(internal.Cfg.IsDevMode, internal.DB)
	router.Run(":" + internal.Cfg.Port)
}
