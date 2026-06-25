package services

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jimcarey1/ecommerce/internal/db"
)


type CategoryService struct{
	repo *db.Queries
}

func NewCategoryService(repo *db.Queries) *CategoryService{
	return &CategoryService{repo: repo}
}

func (service *CategoryService) CreateCategory(ctx context.Context, data db.CreateCategoryParams) (db.Category, error){
	return service.repo.CreateCategory(ctx, data)
}

func (service *CategoryService) GetCategoryByName(ctx context.Context, categoryName string) (db.GetCategoryByNameRow, error) {
	return service.repo.GetCategoryByName(ctx, categoryName)
}

func (service *CategoryService) GetParentCategories(ctx context.Context) ([]db.GetParentCategoriesRow, error){
	return service.repo.GetParentCategories(ctx)
}

func (service *CategoryService) GetChildCategories(ctx context.Context, categoryId int) ([]db.GetSubCategoriesRow, error){
	categoryID := pgtype.Int4{
		Int32: int32(categoryId),
		Valid: true,
	}
	return service.repo.GetSubCategories(ctx, categoryID)
}