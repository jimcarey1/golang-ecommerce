package httpapi

import (
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/jimcarey1/ecommerce/internal/services"
)

func NewServer(userService *services.UserService, addressService *services.AddressService) http.Handler {
	mux := mux.NewRouter()

	addRoutes(mux, userService, addressService)
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
