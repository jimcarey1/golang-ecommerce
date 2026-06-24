package services

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/jimcarey1/ecommerce/internal/db"
	"github.com/jimcarey1/ecommerce/internal/utils"
)

type UserService struct {
	repo *db.Queries
	config *aws.Config
}

func NewUserService(query *db.Queries, config *aws.Config) *UserService {
	return &UserService{repo: query, config: config}
}

func (service *UserService) CreateUser(ctx context.Context, data db.CreateUserParams) (db.User, error) {
	//Hash the password before saving user to the database.
	hashedPassword, err := utils.HashPassword(data.HashedPassword)
	if err != nil {
		return db.User{}, err
	}
	data.HashedPassword = hashedPassword
	return service.repo.CreateUser(ctx, data)
}

func (service *UserService) GetUserById(ctx context.Context, id int32) (db.User, error) {
	return service.repo.GetUserById(ctx, id)
}

func (service *UserService) GetUserByEmail(ctx context.Context, email string) (db.User, error) {
	return service.repo.GetUserByEmail(ctx, email)
}

func (service *UserService) GeneratePresignedUrl(ctx context.Context, bucketName, keyName string) (string, error) {
	return utils.GetPresignURL(ctx, *service.config, bucketName, keyName)
}
