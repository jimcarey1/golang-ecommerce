-- name: GetUserById :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (full_name, email, hashed_password)
VALUES ($1, $2, $3)
RETURNING *;


-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 LIMIT 1;