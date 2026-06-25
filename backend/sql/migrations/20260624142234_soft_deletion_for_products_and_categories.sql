-- +goose Up
ALTER TABLE categories ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE products ALTER COLUMN subcategory_id SET NOT NULL;
ALTER TABLE products ALTER COLUMN user_id SET NOT NULL;

-- +goose Down
ALTER TABLE categories REMOVE COLUMN is_deleted;
ALTER TABLE products REMOVE COLUMN is_deleted;
ALTER TABLE products ALTER COLUMN category_id SET NULL;
ALTER TABLE products ALTER COLUMN subcategory_id SET NULL;
ALTER TABLE products ALTER COLUMN user_id SET NULL;