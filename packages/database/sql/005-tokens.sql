BEGIN;

CREATE TABLE tokens (
    user_id SERIAL REFERENCES users(id) PRIMARY KEY,
    access_token VARCHAR(50),
    refresh_token VARCHAR(50),
    expires_at TIMESTAMP,
    token_type token_type
);

COMMIT;
