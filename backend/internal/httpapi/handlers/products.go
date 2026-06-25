package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jimcarey1/ecommerce/internal/db"
	"github.com/jimcarey1/ecommerce/internal/services"
)

func HanldeCreateProduct(service *services.ProductService) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()

		type createProductPayload struct{
			ProductName string
			ProductDescription string
			Price float64
			CategoryID int
			SubCategoryID int
			Mode string
			Brand string
			Images []string
			UserID int
			Attributes json.RawMessage
		}
		var req createProductPayload
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil{
			fmt.Println(err)
			http.Error(w, fmt.Sprintf("Error parsing the json: %v\n", err), http.StatusBadRequest)
			return
		}

		var price pgtype.Numeric
		err := price.ScanScientific(fmt.Sprintf("%v", req.Price))
		if err != nil{
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}

		dbParams := db.CreateProductParams{
			ProductName: req.ProductName,
			ProductDescription: req.ProductDescription,
			Price: price,
			CategoryID: int32(req.CategoryID),
			SubcategoryID: int32(req.SubCategoryID),
			Mode: db.SellMode(req.Mode),
			Brand: req.Mode,
			Images: req.Images,
			UserID: int32(req.UserID),
			Attributes: req.Attributes,
		}	

		product, err := service.CreateNewProduct(r.Context(), dbParams)
		if err != nil{
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}

		if err = json.NewEncoder(w).Encode(product); err != nil{
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
		}
	})
}
