-- name: CreateAddress :one
INSERT INTO addresses (line1, line2, city, state_name, postal_code, country, user_id)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetUserAddresses :many
SELECT line1, line2, city, state_name, postal_code, country FROM addresses
WHERE user_id = $1;