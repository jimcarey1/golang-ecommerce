package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jimcarey1/ecommerce/internal/db"
	"github.com/jimcarey1/ecommerce/internal/httpapi"
	"github.com/jimcarey1/ecommerce/internal/services"
)

func main() {
	ctx := context.Background()
	connectionString := "postgres://test_user:yourpassword@localhost:5432/test_db?sslmode=disable"

	conn, err := pgxpool.New(ctx, connectionString)
	if err != nil {
		log.Fatalf("Error connecting to postgres: %v\n", err)
	}
	defer conn.Close()

	queries := db.New(conn)
	awsCfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("ap-south-2"),
	)
	if err != nil {
		log.Fatalf("Got an error configuring aws: %v\n", err)
	}

	userService := services.NewUserService(queries, &awsCfg)
	addressService := services.NewAddressService(queries)
	productService := services.NewProductService(queries)
	categoryService := services.NewCategoryService(queries)

	handler := httpapi.NewServer(userService, addressService, productService, categoryService)

	server := http.Server{
		Addr:         "localhost:8080",
		Handler:      handler,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Error starting the web server: %v\n", err)
	}
}
