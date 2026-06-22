package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/jimcarey1/ecommerce/internal/db"
	"github.com/jimcarey1/ecommerce/internal/services"
	"github.com/jimcarey1/ecommerce/internal/utils"
)

func HandleCreateUser(userService *services.UserService) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()
		var userPayload db.CreateUserParams
		if err := json.NewDecoder(r.Body).Decode(&userPayload); err != nil {
			fmt.Println(err)
			http.Error(w, "Invalid JSON body", http.StatusBadRequest)
			return
		}

		user, err := userService.CreateUser(r.Context(), userPayload)
		if err != nil {
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}
		if err := json.NewEncoder(w).Encode(user); err != nil {
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}
	})
}

func HandleUserLogin(userService *services.UserService) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()

		//Define LoginPayload struct
		type LoginPayload struct {
			Email    string
			Password string
		}

		type LoginResponse struct {
			AccessToken string
		}

		var loginPayload LoginPayload
		if err := json.NewDecoder(r.Body).Decode(&loginPayload); err != nil {
			http.Error(w, fmt.Sprintf("%v\n", err), http.StatusBadRequest)
		}

		user, err := userService.GetUserByEmail(r.Context(), loginPayload.Email)
		if err != nil {
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}

		if !utils.VerifyPassword(loginPayload.Password, user.HashedPassword) {
			http.Error(w, fmt.Sprintln("Invalid Username or Password"), http.StatusBadRequest)
			return
		}

		accessToken, err := utils.GenerateAccessToken(int(user.ID), user.Email, user.FullName)
		refreshToken, err := utils.GenerateRefreshToken(int(user.ID), user.Email)

		if err != nil {
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}

		cookie := http.Cookie{
			Name:     "refresh_token",
			Value:    refreshToken,
			Path: "/",
			Expires:  time.Now().Add(30 * 24 * 60 * time.Minute),
			Secure:   false,
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		}
		http.SetCookie(w, &cookie)
		response := LoginResponse{
			AccessToken: accessToken,
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})
}
