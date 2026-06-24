-- +goose Up
ALTER TABLE products ADD COLUMN images VARCHAR(100)[];

-- +goose Down
ALTER TABLE products DROP COLUMN images;