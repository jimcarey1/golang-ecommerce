package httpapi

import (
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/jimcarey1/ecommerce/internal/users"
)

func NewServer(userService *users.UserService) http.Handler {
	mux := mux.NewRouter()

	addRoutes(mux, userService)
	var handler http.Handler = mux
	handler = handlers.LoggingHandler(os.Stdout, handler)
	handler = handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:5173", "http://127.0.0.1:5173"}),
		handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS", "HEAD"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
		handlers.AllowCredentials(),
	)(handler)

	return handler
}
