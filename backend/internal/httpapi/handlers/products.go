package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jimcarey1/ecommerce/internal/db"
	"github.com/jimcarey1/ecommerce/internal/services"
)

type productResponse struct {
	ID                 int32
	ProductName        string
	ProductDescription string
	Brand              string
	Price              pgtype.Numeric
	Mode               db.SellMode
	Attributes         json.RawMessage
	CategoryID         int32
	SubCategoryID      int32
	UserID             int32
	CreatedAt          pgtype.Timestamptz
	UpdatedAt          pgtype.Timestamptz
	Images             []string
}

func HanldeCreateProduct(service *services.ProductService) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()

		var req productResponse
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			fmt.Println(err)
			http.Error(w, fmt.Sprintf("Error parsing the json: %v\n", err), http.StatusBadRequest)
			return
		}
		var price pgtype.Numeric
		err := price.ScanScientific(fmt.Sprintf("%v", req.Price))
		if err != nil {
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}

		dbParams := db.CreateProductParams{
			ProductName:        req.ProductName,
			ProductDescription: req.ProductDescription,
			Price:              price,
			CategoryID:         int32(req.CategoryID),
			SubcategoryID:      int32(req.SubCategoryID),
			Mode:               db.SellMode(req.Mode),
			Brand:              req.Brand,
			Images:             req.Images,
			UserID:             int32(req.UserID),
			Attributes:         req.Attributes,
		}

		product, err := service.CreateNewProduct(r.Context(), dbParams)
		if err != nil {
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}

		if err = json.NewEncoder(w).Encode(product); err != nil {
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
		}
	})
}

func HandleGetIndividualProduct(service *services.ProductService) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		productId, ok := vars["productId"]
		//If the productId is missing, return an error.
		if !ok {
			http.Error(w, "Missing path parameter: productId", http.StatusBadRequest)
			return
		}
		//We are ignoring the error because, We are using regex pattern on routes.
		productIdInt, _ := strconv.Atoi(productId)

		dbProduct, err := service.GetProductById(r.Context(), productIdInt)
		if err != nil {
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}

		if err := json.NewEncoder(w).Encode(dbProduct); err != nil {
			fmt.Println(err)
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}
	})
}
