-- +goose Up
ALTER TABLE products ALTER COLUMN mode SET NOT NULL;

-- +goose Down
ALTER TABLE products ALTER COLUMN mode SET NULL;
