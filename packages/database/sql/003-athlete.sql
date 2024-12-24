BEGIN;

CREATE TABLE athletes (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    resource_state INT,
    firstname TEXT,
    lastname TEXT,
    profile_medium TEXT,
    profile TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    sex TEXT,
    premium BOOLEAN,
    summit BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    follower_count INT,
    friend_count INT,
    measurement_preference TEXT,
    ftp INT,
    weight REAL
);

COMMIT;
