-- name: CreateCategory :one
INSERT INTO categories (category_name, image_url, parent_id)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetSubCategories :many
SELECT id, category_name, image_url
FROM categories
WHERE parent_id = $1 AND is_deleted = false;

-- name: GetParentCategories :many
SELECT id, category_name, image_url
FROM categories
WHERE parent_id IS NULL AND is_deleted = false;

-- name: GetCategoryByName :one
SELECT id, category_name, image_url
FROM categories
WHERE category_name = $1 AND is_deleted = false;
