package services

import (
	"context"

	"github.com/jimcarey1/ecommerce/internal/db"
)

type AddressService struct {
	repo *db.Queries
}

func NewAddressService(repo *db.Queries) *AddressService {
	return &AddressService{repo: repo}
}

func (service *AddressService) CreateAddress(ctx context.Context, data db.CreateAddressParams) (db.Address, error) {
	return service.repo.CreateAddress(ctx, data)
}

func (service *AddressService) GetUserAddresses(ctx context.Context, userId int32) ([]db.GetUserAddressesRow, error) {
	return service.repo.GetUserAddresses(ctx, userId)
}