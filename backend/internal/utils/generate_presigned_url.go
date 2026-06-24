package utils

import (
	"context"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func GetPresignURL(ctx context.Context, cfg aws.Config, bucketName, keyName string) (string, error) {
	s3client := s3.NewFromConfig(cfg)
	presignClient := s3.NewPresignClient(s3client)
	presignedUrl, err := presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket: &bucketName,
		Key:    &keyName,
	},
		s3.WithPresignExpires(15*time.Minute),
	)
	if err != nil {
		return "", err
	}
	return presignedUrl.URL, nil
}
