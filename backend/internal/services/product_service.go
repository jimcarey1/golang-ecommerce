package services

import (
	"context"

	"github.com/jimcarey1/ecommerce/internal/db"
)

type ProductService struct{
	repo *db.Queries
}

func NewProductService(repo *db.Queries) *ProductService{
	return &ProductService{repo: repo}
}

func (service *ProductService) CreateNewProduct(ctx context.Context, data db.CreateProductParams) (db.Product, error) {
	return service.repo.CreateProduct(ctx, data)
}

func (service *ProductService) GetProductById(ctx context.Context, id int) (db.Product, error){
	return service.repo.GetProductById(ctx, int32(id))
}

func (service *ProductService) GetProductsByCategoryTree(ctx context.Context, categoryId int) ([]db.Product, error){
	return service.repo.GetPrdouctsByCategoryTreee(ctx, int32(categoryId))
}

func (service *ProductService) GetProducts(ctx context.Context) ([]db.Product, error){
	return service.repo.GetProducts(ctx)
}