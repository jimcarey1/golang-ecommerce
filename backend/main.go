package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jimcarey1/ecommerce/internal/db"
	"github.com/jimcarey1/ecommerce/internal/httpapi"
	"github.com/jimcarey1/ecommerce/internal/services"
)

func main(){
	ctx := context.Background()
	connectionString := "postgres://test_user:yourpassword@localhost:5432/test_db?sslmode=disable"

	conn, err := pgx.Connect(ctx, connectionString)
	if err != nil{
		log.Fatalf("Error connecting to postgres: %v\n", err)
	}
	defer conn.Close(ctx)

	queries := db.New(conn)

	userService := services.NewUserService(queries)
	addressService := services.NewAddressService(queries)

	handler := httpapi.NewServer(userService, addressService)

	server := http.Server{
		Addr: "localhost:8080",
		Handler: handler,
		ReadTimeout: 5 * time.Second,
		WriteTimeout: 5 * time.Second,
	}
	
	if err := server.ListenAndServe(); err != nil{
		log.Fatalf("Error starting the web server: %v\n", err)
	}
}