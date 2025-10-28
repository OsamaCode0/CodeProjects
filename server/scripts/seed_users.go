package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

var (
	firstNames = []string{
		"Emma", "Olivia", "Ava", "Sophia", "Isabella", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn",
		"Liam", "Noah", "Oliver", "Elijah", "William", "James", "Benjamin", "Lucas", "Henry", "Alexander",
		"Sofia", "Emily", "Madison", "Scarlett", "Victoria", "Aria", "Grace", "Chloe", "Camila", "Penelope",
		"Michael", "Ethan", "Daniel", "Matthew", "Jackson", "David", "Sebastian", "Joseph", "Carter", "Owen",
	}
	
	cities = []string{
		"Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä", "Lahti", "Kuopio", "Pori",
	}
	
	languages = [][]string{
		{"Finnish", "English"},
		{"Finnish", "Swedish"},
		{"Finnish"},
		{"English"},
		{"Finnish", "English", "Swedish"},
	}
	
	interests = []string{
		"drawing", "reading", "sports", "music", "dancing", "swimming", "puzzles", "lego", 
		"dolls", "cars", "dinosaurs", "animals", "crafts", "video games", "cooking", "nature",
	}
	
	activityLevels = []string{"low", "medium", "high"}
	genders = []string{"male", "female", "non-binary"}
	playStyles = []string{"cooperative", "competitive", "solo", "group"}
	allergies = []string{"none", "peanuts", "dairy", "gluten"}
)

func main() {
	// Load .env
	if err := godotenv.Load("/home/las/match-me/server/.env"); err != nil {
			log.Println("No .env file found, using environment variables")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL not set")
	}

	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer pool.Close()

	rand.Seed(time.Now().UnixNano())

	fmt.Println("Creating 100 test users...")

	for i := 1; i <= 100; i++ {
		email := fmt.Sprintf("test%d@example.com", i)
		password := "password123"
		
		// Hash password
		hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash password for user %d: %v", i, err)
			continue
		}

		// Create user
		var userID string
		err = pool.QueryRow(context.Background(), 
			"INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
			email, string(hash),
		).Scan(&userID)
		
		if err != nil {
			log.Printf("Failed to create user %d: %v", i, err)
			continue
		}

		// Create parent profile
		name := firstNames[rand.Intn(len(firstNames))]
		city := cities[rand.Intn(len(cities))]
		gender := genders[rand.Intn(len(genders))]
		langs := languages[rand.Intn(len(languages))]
		
		// Helsinki coordinates with some randomness
		lat := 60.1699 + (rand.Float64()-0.5)*0.5
		lon := 24.9384 + (rand.Float64()-0.5)*0.5
		
		_, err = pool.Exec(context.Background(), `
			INSERT INTO parent_profiles 
			(user_id, name, gender, about, languages, address_city, lat, lon, preferred_distance_km)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, userID, name, gender, 
			fmt.Sprintf("I'm a parent from %s looking for playdates!", city),
			langs, city, lat, lon, 20)
		
		if err != nil {
			log.Printf("Failed to create profile for user %d: %v", i, err)
			continue
		}

		// Create child profile
		childName := firstNames[rand.Intn(len(firstNames))]
		childGender := genders[rand.Intn(len(genders))]
		childAge := rand.Intn(10) + 1 // 1-10 years
		birthday := time.Now().AddDate(-childAge, 0, 0)
		
		// Random interests (3-5)
		numInterests := 3 + rand.Intn(3)
		childInterests := make([]string, numInterests)
		for j := 0; j < numInterests; j++ {
			childInterests[j] = interests[rand.Intn(len(interests))]
		}
		
		activityLevel := activityLevels[rand.Intn(len(activityLevels))]
		playStyle := []string{playStyles[rand.Intn(len(playStyles))]}
		allergy := []string{allergies[rand.Intn(len(allergies))]}
		
		_, err = pool.Exec(context.Background(), `
			INSERT INTO children 
			(user_id, name, birthday, gender, about_short, interests, activity_level, limitations, allergies, play_styles)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		`, userID, childName, birthday, childGender,
			fmt.Sprintf("%s is a wonderful child who loves to play!", childName),
			childInterests, activityLevel, []string{}, allergy, playStyle)
		
		if err != nil {
			log.Printf("Failed to create child for user %d: %v", i, err)
			continue
		}

		if i%10 == 0 {
			fmt.Printf("Created %d users...\n", i)
		}
	}

	fmt.Println("\n✅ Successfully created 100 test users!")
	fmt.Println("All users have password: password123")
	fmt.Println("Emails: test1@example.com through test100@example.com")
}