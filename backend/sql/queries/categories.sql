-- name: CreateCategory :one
INSERT INTO categories (category_name, image_url, parent_id)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetSubCategories :many
SELECT category_name, image_url
FROM categories
WHERE parent_id = $1;

-- name: GetParentCategories :many
SELECT category_name, image_url
FROM categories
WHERE parent_id IS NULL;

-- name: GetCategoryByName :one
SELECT category_name, image_url
FROM categories
WHERE category_name = $1;