-- +goose Up
ALTER TABLE addresses ADD COLUMN is_primary BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX one_primary_address_per_user 
ON addresses (user_id) 
WHERE is_primary = true;

-- +goose Down
ALTER TABLE addresses DROP COLUMN is_primary;
DROP INDEX one_primary_address_per_user;
