package httpapi

import (
	"github.com/gorilla/mux"
	"github.com/jimcarey1/ecommerce/internal/httpapi/handlers"
	"github.com/jimcarey1/ecommerce/internal/users"
)

func addRoutes(mux *mux.Router, userService *users.UserService){
	mux.Handle("/auth/create", handlers.HandleCreateUser(userService)).Methods("POST")
	mux.Handle("/auth/login", handlers.HandleUserLogin(userService)).Methods("POST")
}