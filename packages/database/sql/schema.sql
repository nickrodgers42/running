CREATE TABLE users (
    user_id serial PRIMARY KEY,
    username VARCHAR(32) unique NOT NULL
);

INSERT INTO users (user_id, username)
VALUES (DEFAULT, 'localuser');

CREATE TABLE tokens (
    user_id INT REFERENCES users(user_id),
    expires_at TIMESTAMP,
    refresh_token VARCHAR(50),
    access_token VARCHAR(50)
);
