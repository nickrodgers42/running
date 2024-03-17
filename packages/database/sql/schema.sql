CREATE DATABASE running;

\c running

CREATE TABLE users(
    user_id serial PRIMARY KEY,
    username VARCHAR(32) unique NOT NULL
);
