// file for loading server/.env and saving it into struct in order to use after
package internal

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

var Cfg *Config

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
	CORSOrigin  string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found")
	}

	var c Config	
	c.Port = os.Getenv("PORT")
	c.DatabaseURL = os.Getenv("DATABASE_URL")
	c.JWTSecret = os.Getenv("JWT_SECRET")
	c.CORSOrigin = os.Getenv("CORS_ORIGIN")

	Cfg = &c
	log.Println(".env read succesfully")
	return Cfg
}
