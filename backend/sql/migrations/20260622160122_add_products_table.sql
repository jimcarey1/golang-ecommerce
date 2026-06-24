-- +goose Up
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(255) UNIQUE NOT NULL,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    parent_id INT REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TYPE sell_mode AS ENUM ('fixed', 'auction');

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT NOT NULL,
    brand VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    mode sell_mode DEFAULT 'fixed',
    attributes JSONB NULL,

    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id INT REFERENCES categories(id) ON DELETE SET NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
IF EXISTS DROP TABLE products
IF EXISTS DROP TABLE categories;