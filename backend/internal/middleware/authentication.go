package middleware

import (
	"fmt"
	"net/http"
	"strings"
)

func AuthenticationMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authToken := r.Header.Get("Authorization")
		if authToken == "" || !strings.HasPrefix(authToken, "Bearer"){
			http.Error(w, fmt.Sprintln("Unauthorized Error"), http.StatusUnauthorized)
			return
		}
		//Get the actual jwt token from the header value.
		authToken = strings.Split(authToken, " ")[1]
	})
}
