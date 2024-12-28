BEGIN;

CREATE EXTENSION pgcrypto;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) unique NOT NULL,
    password_has TEXT NOT NULL
);

INSERT INTO users (id, username)
VALUES (DEFAULT, 'localuser', crypt('password', gen_salt('md5')));

COMMIT;
