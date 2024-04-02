CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(32) unique NOT NULL
);

INSERT INTO users (user_id, username)
VALUES (DEFAULT, 'localuser');

CREATE TYPE tokenType AS ENUM (
    'Bearer'
);

CREATE TABLE tokens (
    user_id SERIAL REFERENCES users(user_id) PRIMARY KEY,
    access_token VARCHAR(50),
    refresh_token VARCHAR(50),
    expires_at TIMESTAMP,
    token_type tokenType
);

CREATE TABLE athletes (
    user_id SERIAL REFERENCES users(user_id) PRIMARY KEY,
    athlete_id BIGINT
);

CREATE TYPE sport AS ENUM (
    'AlpineSki', 'BackcountrySki', 'Badminton', 'Canoeing', 'Crossfit',
    'EBikeRide', 'Elliptical', 'EMountainBikeRide', 'Golf', 'GravelRide',
    'Handcycle', 'HighIntensityIntervalTraining', 'Hike', 'IceSkate',
    'InlineSkate', 'Kayaking', 'Kitesurf', 'MountainBikeRide', 'NordicSki',
    'Pickleball', 'Pilates', 'Racquetball', 'Ride', 'RockClimbing',
    'RollerSki', 'Rowing', 'Run', 'Sail', 'Skateboard', 'Snowboard',
    'Snowshoe', 'Soccer', 'Squash', 'StairStepper', 'StandUpPaddling',
    'Surfing', 'Swim', 'TableTennis', 'Tennis', 'TrailRun', 'Velomobile',
    'VirtualRide', 'VirtualRow', 'VirtualRun', 'Walk', 'WeightTraining',
    'Wheelchair', 'Windsurf', 'Workout', 'Yoga'
);

CREATE TYPE polyline_map AS (
    id TEXT,
    polyline TEXT,
    summary_polyline TEXT
);

CREATE TABLE activities (
    activity_id BIGINT PRIMARY KEY,
    user_id SERIAL REFERENCES users(user_id),
    name TEXT,
    distance NUMERIC,
    moving_time INT,
    elapsed_time INT,
    total_elevation_gain NUMERIC,
    elev_high NUMERIC,
    elev_low NUMERIC,
    sport_type sport,
    start_date TIMESTAMP,
    start_date_local TIMESTAMP,
    timezone TEXT,
    start_latlng POINT,
    end_latlng POINT,
    achievement_count INT,
    kudos_count INT,
    comment_count INT,
    athlete_count INT,
    photo_count INT,
    total_photo_count INT,
    map polyline_map,
    trainer BOOLEAN,
    commute BOOLEAN,
    manual BOOLEAN,
    private BOOLEAN,
    flagged BOOLEAN,
    workout_type INT,
    average_speed NUMERIC,
    max_speed FLOAT,
    has_kudoed BOOLEAN,
    hide_from_home BOOLEAN,
    gear_id TEXT,
    description TEXT,
    calories NUMERIC,
    device_name TEXT,
    embed_token TEXT
);
