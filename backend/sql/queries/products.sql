-- name: CreateProduct :one
INSERT INTO products (product_name, product_description, brand, price, mode, attributes, category_id, subcategory_id, user_id, images)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING *;

-- name: GetProductById :one
SELECT * FROM products
WHERE id = $1 LIMIT 1;

-- name: GetProductsByCategory :many
SELECT * FROM products
WHERE category_id = $1;