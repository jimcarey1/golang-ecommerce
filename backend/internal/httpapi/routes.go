package httpapi

import (
	"github.com/gorilla/mux"
	"github.com/jimcarey1/ecommerce/internal/httpapi/handlers"
	"github.com/jimcarey1/ecommerce/internal/services"
)

func addRoutes(
	mux *mux.Router,
	userService *services.UserService,
	addressService *services.AddressService,
	productService *services.ProductService,
	categoryService *services.CategoryService,
) {
	mux.Handle("/auth/create", handlers.HandleCreateUser(userService)).Methods("POST")
	mux.Handle("/auth/login", handlers.HandleUserLogin(userService)).Methods("POST")
	mux.Handle("/get-presigned/url", handlers.GeneratePresignedUrl(userService)).Methods("GET")

	mux.Handle("/user/{userId:[0-9]+}/addresses/add", handlers.HandleCreateAddress(addressService)).Methods("POST")
	mux.Handle("/user/{userId:[0-9]+}/addresses", handlers.HandleGetUserAddresses(addressService)).Methods("GET")

	mux.Handle("/products/add", handlers.HanldeCreateProduct(productService)).Methods("POST")
	mux.Handle("/products/{productId:[0-9]+}", handlers.HandleGetIndividualProduct(productService)).Methods("GET")
	mux.Handle("/products/category/{categoryId:[0-9]+}", handlers.HandleGetProductsByCategorySubtree(productService)).Methods("GET")
	mux.Handle("/products", handlers.HandleGetProducts(productService)).Methods("GET")

	mux.Handle("/category/add", handlers.HandleCreateCategory(categoryService)).Methods("POST")
	mux.Handle("/category/parents", handlers.HandleGetParentCategories(categoryService)).Methods("GET")
	mux.Handle("/category/{categoryName}", handlers.HandleGetCategory(categoryService)).Methods("GET")
	mux.Handle("/category/{categoryId:[0-9]+}/children", handlers.HandleGetChildCategories(categoryService)).Methods("GET")
}
