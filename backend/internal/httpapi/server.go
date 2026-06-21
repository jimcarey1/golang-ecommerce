package httpapi

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jimcarey1/ecommerce/internal/users"
)

func NewServer(userService *users.UserService) http.Handler{
	mux := mux.NewRouter()

	addRoutes(mux, userService)
	var handler http.Handler = mux

	return handler
}