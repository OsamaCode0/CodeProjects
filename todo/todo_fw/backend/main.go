package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"todo/internal/database"
	"todo/internal/handler"
	https "todo/internal/http"
	"todo/internal/types"

	"github.com/gorilla/mux"
)

const port = 8081

func main() {
	var app = types.Application{}

	flag.StringVar(&app.DSN, "dsn", "host=localhost port=5433 user=postgres password=postgres dbname=todo.db sslmode=disable timezone=UTC connect_timeout=5", "Postgres connection string")
	flag.Parse()

	db, err := database.OpenDB(app.DSN)
	if err != nil {
		log.Printf("Error opening database:\n%v", err)
		log.Println("You probably need to run docker for out database first")
		return
	}
	defer db.Db.Close()
	app.Router = mux.NewRouter()
	hDb := &handler.DB{
		DB: db,
	}

	app.Router.HandleFunc("/register", hDb.RegisterUser).Methods("POST")
	app.Router.HandleFunc("/login", hDb.LoginUser).Methods("POST")
	app.Router.HandleFunc("/logout", hDb.LogoutUser).Methods("POST")
	app.Router.HandleFunc("/user/{id}", hDb.FindUserById).Methods("GET")
	app.Router.HandleFunc("/user/todo", hDb.AddTodo).Methods("POST")
	app.Router.HandleFunc("/user/todo", hDb.UpdateTodo).Methods("PUT")
	app.Router.HandleFunc("/user/todo", hDb.DeleteTodo).Methods("DELETE")
	app.Router.HandleFunc("/user/todo/history/{user_id}", hDb.GetHistory).Methods("GET")
	app.Router.HandleFunc("/user/todo/{user_id}", hDb.GetAllTodo).Methods("GET")
	app.Router.HandleFunc("/user/todo/{user_id}/{key_word}", hDb.SearchTodoByContent).Methods("GET")

	authMiddleware := https.NewAuthMiddleware()
	handler := https.CORS(authMiddleware.Handler(app.Router))

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: handler,
	}

	// Create a channel to listen for operating system interrupt signals (e.g., Ctrl+C).
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// Launch the HTTP server in a separate goroutine so it doesn't block execution.
	go func() {
		log.Printf("Starting server on http://localhost:%d", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not listen on localhost:%d: %v\n", port, err)
		}
	}()

	// Block here and wait until a shutdown signal is received.
	<-stop
	log.Println("Shutting down server...")

	// Create a context with a timeout of 5 seconds to allow for graceful shutdown.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Attempt to gracefully shut down the server using the context.
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
		return
	}

	log.Println("Server exited gracefully")

}
