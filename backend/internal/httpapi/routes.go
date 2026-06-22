package httpapi

import (
	"github.com/gorilla/mux"
	"github.com/jimcarey1/ecommerce/internal/httpapi/handlers"
	"github.com/jimcarey1/ecommerce/internal/services"
)

func addRoutes(mux *mux.Router, userService *services.UserService, addressService *services.AddressService) {
	mux.Handle("/auth/create", handlers.HandleCreateUser(userService)).Methods("POST")
	mux.Handle("/auth/login", handlers.HandleUserLogin(userService)).Methods("POST")

	mux.Handle("/user/{userId:[0-9]+}/addresses/add", handlers.HandleCreateAddress(addressService)).Methods("POST")
	mux.Handle("/user/{userId:[0-9]+}/addresses", handlers.HandleGetUserAddresses(addressService)).Methods("GET")
}
