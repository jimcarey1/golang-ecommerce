package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/jimcarey1/ecommerce/internal/db"
	"github.com/jimcarey1/ecommerce/internal/services"
)

// This function handles the route for creating the address.
func HandleCreateAddress(service *services.AddressService) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		vars := mux.Vars(r)
		userId, _ := strconv.Atoi(vars["userId"])
		var addressPayload db.CreateAddressParams
		if err := json.NewDecoder(r.Body).Decode(&addressPayload); err != nil {
			fmt.Printf("Got an error: %v\n", err)
			http.Error(w, fmt.Sprintf("Invalid JSON body: %v\n", err), http.StatusBadRequest)
			return
		}

		//We are not sending the userId in the request body,
		//We can extract it from request path parameters.
		addressPayload.UserID = int32(userId)
		fmt.Println(addressPayload.Line1, addressPayload.Line2, addressPayload.City, addressPayload.UserID)

		address, err := service.CreateAddress(ctx, addressPayload)
		if err != nil {
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(address)
	})
}

// This function handles the route for getting the addresses associated with user.
func HandleGetUserAddresses(service *services.AddressService) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		vars := mux.Vars(r)
		userId, err := strconv.Atoi(vars["userId"])

		userAddresses, err := service.GetUserAddresses(ctx, int32(userId))
		if err != nil {
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(userAddresses)
	})
}
