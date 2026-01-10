package types

import (
	"github.com/gorilla/mux"
)

type (
	Application struct {
		DSN    string
		Router *mux.Router
	}
)
