package http

import (
	"net/http"
)

type (
	AuthMiddleware interface {
		Handler(next http.Handler) http.Handler
	}

	AuthMiddlewareImplementation struct {
	}
)

func NewAuthMiddleware() AuthMiddleware {
	return &AuthMiddlewareImplementation{}
}

func (auth *AuthMiddlewareImplementation) Handler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		next.ServeHTTP(w, r)
	})

}
