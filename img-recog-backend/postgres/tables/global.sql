CREATE TABLE global (
    id serial PRIMARY KEY,
    name VARCHAR(100),
    entries BIGINT DEFAULT 0
);