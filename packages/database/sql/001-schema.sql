BEGIN;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) unique NOT NULL
);

INSERT INTO users (id, username)
VALUES (DEFAULT, 'localuser');

COMMIT;
