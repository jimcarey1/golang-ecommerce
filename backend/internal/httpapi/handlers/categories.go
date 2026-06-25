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

func HandleCreateCategory(service *services.CategoryService) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()
		type createCategoryParams struct {
			CategoryName string
			ImageUrl     string
			ParentId     int
		}
		var req createCategoryParams

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil{
			fmt.Println(err)
			http.Error(w, fmt.Sprintf("Error parsing request body: %v\n", err), http.StatusBadRequest)
			return
		}

		//Generate the struct that the sqlc generated for us.
		dbData := db.CreateCategoryParams{
			CategoryName: req.CategoryName,
			ImageUrl: pgtype.Text{
				String: req.ImageUrl,
				Valid: len(req.ImageUrl) > 0,
			},
			ParentID: pgtype.Int4{
				Int32: int32(req.ParentId),
				Valid: (req.ParentId != 0),
			},
		}

		category, err := service.CreateCategory(r.Context(), dbData)
		if err != nil{
			fmt.Printf("Error creating the category: %v\n", err)
			http.Error(w, fmt.Sprintf("Internal server error: %v\n", err), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(category)
	})
}

func HandleGetCategory(service *services.CategoryService) http.Handler{
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//Get the categoryId from the path params.
		vars := mux.Vars(r)
		categoryName, ok := vars["categoryId"]
		if !ok{
			http.Error(w, fmt.Sprintf("Missing path parameter: %v\n", categoryName), http.StatusBadRequest)
			return
		}

		data, err := service.GetCategoryByName(r.Context(), categoryName)
		if err != nil{
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(data)
	})
}

func HandleGetParentCategories(service *services.CategoryService) http.Handler{
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		data, err := service.GetParentCategories(r.Context())
		if err != nil{
			fmt.Print(err)
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}

		if data == nil{
			data = []db.GetParentCategoriesRow{}
		}
		json.NewEncoder(w).Encode(data)
	})
}

func HandleGetChildCategories(service *services.CategoryService) http.Handler{
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		parentId, ok := vars["categoryId"]
		if !ok{
			http.Error(w, "Missing Path Parameter: parentId.\n", http.StatusBadRequest)
			return
		}
		categoryId, _ := strconv.Atoi(parentId)
		data, err := service.GetChildCategories(r.Context(), categoryId)
		if err != nil{
			http.Error(w, fmt.Sprintf("Internal Server Error: %v\n", err), http.StatusInternalServerError)
			return
		}

		if data == nil{
			data = []db.GetSubCategoriesRow{}
		}

		json.NewEncoder(w).Encode(data)
	})
}
