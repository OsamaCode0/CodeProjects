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

	err = internal.InitializeDB()
    if err != nil {
        log.Fatal("Failed to initialize database:", err)
    }

	router := handlers.SetupRouter()
	router.Run(":" + internal.Cfg.Port)
}
