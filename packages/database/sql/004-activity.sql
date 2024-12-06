BEGIN;
CREATE TABLE gear (
    id BIGINT PRIMARY KEY,
    resource_state INT,
    primary_gear BOOLEAN,
    name TEXT,
    distance NUMERIC,
    brand_name TEXT,
    model_name TEXT,
    frame_type TEXT,
    description TEXT
);

CREATE TABLE segment_efforts (
    id BIGINT PRIMARY KEY,
    activity_id BIGINT,
    elapsed_time INT,
    start_date TIMESTAMP,
    start_date_local TIMESTAMP,
    distance NUMERIC,
    is_kom BOOLEAN,
    name TEXT,
    activity meta_activity,
    athlete meta_athlete,
    moving_time INT,
    start_index INT,
    end_index INT,
    average_cadence NUMERIC,
    average_watts NUMERIC,
    device_watts BOOLEAN,
    average_heartrate NUMERIC,
    max_heartrate NUMERIC,
    segment BIGINT[],
    kom_rank INT,
    pr_rank INT,
    hidden BOOLEAN
);

CREATE TABLE segments (
    id BIGINT PRIMARY KEY,
    name TEXT,
    activity_type TEXT,
    distance NUMERIC,
    average_grade NUMERIC,
    maximum_grade NUMERIC,
    elevation_high NUMERIC,
    elevation_low NUMERIC,
    start_latlng POINT,
    end_latlng POINT,
    climb_category INT,
    city TEXT,
    state TEXT,
    country TEXT,
    private BOOLEAN,
    athlete_pr_effort summary_pr_segment_effort,
    athlete_segment_stats BIGINT REFERENCES segment_efforts(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    total_elevation_gain NUMERIC,
    map polyline_map,
    effort_count INT,
    athlete_count INT,
    hazardous BOOLEAN,
    star_count INT
);

CREATE TABLE laps (
    id BIGINT PRIMARY KEY,
    activity meta_activity,
    athlete meta_athlete,
    average_cadence NUMERIC,
    average_speed NUMERIC,
    distance NUMERIC,
    elapsed_time INT,
    start_index INT,
    end_index INT,
    lap_index INT,
    max_speed NUMERIC,
    moving_time INT,
    name TEXT,
    pace_zone INT,
    split INT,
    start_date TIMESTAMP,
    start_date_local TIMESTAMP,
    total_elevation_gain NUMERIC
);

CREATE TABLE activities (
    id BIGINT PRIMARY KEY,
    user_id SERIAL REFERENCES users(id),
    external_id TEXT,
    upload_id BIGINT,
    athlete BIGINT REFERENCES athletes(id),
    name TEXT,
    distance NUMERIC,
    moving_time INT,
    elapsed_time INT,
    total_elevation_gain NUMERIC,
    elev_high NUMERIC,
    elev_low NUMERIC,
    type activity_type,
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
    upload_id_str TEXT,
    average_speed NUMERIC,
    max_speed NUMERIC,
    has_kudoed BOOLEAN,
    hide_from_home BOOLEAN,
    gear_id TEXT,
    kilojoules NUMERIC,
    average_watts NUMERIC,
    device_watts BOOLEAN,
    max_watts INT,
    weighted_average_watts INT,
    description TEXT,
    photos photos_summary,
    gear BIGINT REFERENCES gear(id),
    calories NUMERIC,
    segment_efforts BIGINT[],
    device_name TEXT,
    embed_token TEXT,
    splits_metric split[],
    splits_standard split[],
    laps BIGINT[],
    best_efforts BIGINT[]
);

COMMIT;