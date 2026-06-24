package services

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jimcarey1/ecommerce/internal/db"
)

type CategoryService struct {
	repo *db.Queries
}

func NewCategoryService(repo *db.Queries) *CategoryService {
	return &CategoryService{repo: repo}
}

func (service *CategoryService) AddCategory(ctx context.Context, data db.CreateCategoryParams) (db.Category, error) {
	return service.repo.CreateCategory(ctx, data)
}

func (service *CategoryService) GetSubCategories(ctx context.Context, parentCategoryId int) ([]db.GetSubCategoriesRow, error) {
	parentId := pgtype.Int4{
		Int32: int32(parentCategoryId),
		Valid: true,
	}
	return service.repo.GetSubCategories(ctx, parentId)
}

func (service *CategoryService) GetParentCategories(ctx context.Context) ([]db.GetParentCategoriesRow, error){
	return service.repo.GetParentCategories(ctx)
}
