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

-- name: GetPrdouctsByCategoryTreee :many
WITH RECURSIVE category_tree AS (
    SELECT c.id, c.category_name, c.parent_id
    FROM categories c
    WHERE c.id = $1

    UNION ALL

    SELECT ct.id, ct.category_name, ct.parent_id
    FROM categories
    INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT p.*
FROM products p
INNER JOIN category_tree ct ON p.category_id = ct.id;


-- name: GetProducts :many
SELECT * FROM products;