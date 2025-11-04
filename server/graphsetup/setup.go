package graphsetup

import (
	"log"
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/vektah/gqlparser/v2/ast" // This was in your server.go
	"matchme-server/graph"
)

// RegisterGraphQL connects the gqlgen server to the Gin router.
func RegisterGraphQL(router gin.IRouter, IsDevMode bool, db *pgxpool.Pool) {

	// 1. Create the Resolver, passing in the database connection
	resolver := &graph.Resolver{
		DB: db,
	}

	// 2. Create the gqlgen server using logic from your server.go
	// We use generated.NewExecutableSchema...
	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))

	// --- All the advanced config from your server.go ---
	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})
	// --- End of server.go logic ---

	// 3. Create the playground handler
	// We'll point it to the /graphql endpoint
	playgroundHandler := playground.Handler("GraphQL playground", "/graphql")

	// 4. Mount endpoints onto the GIN router
	// We'll use /graphql for the API and /playground for the IDE
	router.POST("/graphql", ginAdapter(srv))

	if IsDevMode {
		log.Println("Developer mode enabled. GraphQL Playground is available at /playground")
		router.GET("/playground", ginAdapter(playgroundHandler))
	}
}

// ginAdapter converts a standard http.Handler to a gin.HandlerFunc
func ginAdapter(h http.Handler) gin.HandlerFunc {
	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}
