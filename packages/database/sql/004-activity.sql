BEGIN;
CREATE TABLE gear (
    id TEXT,
    resource_state INT,
    primary_gear BOOLEAN,
    name TEXT,
    distance REAL,
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
    distance REAL,
    is_kom BOOLEAN,
    name TEXT,
    activity meta_activity,
    athlete meta_athlete,
    moving_time INT,
    start_index INT,
    end_index INT,
    average_cadence REAL,
    average_watts REAL,
    device_watts BOOLEAN,
    average_heartrate REAL,
    max_heartrate REAL,
    segment_id BIGINT,
    kom_rank INT,
    pr_rank INT,
    hidden BOOLEAN
);

CREATE TABLE segments (
    id BIGINT PRIMARY KEY,
    name TEXT,
    activity_type activity_type,
    distance REAL,
    average_grade REAL,
    maximum_grade REAL,
    elevation_high REAL,
    elevation_low REAL,
    start_latlng POINT,
    end_latlng POINT,
    climb_category INT,
    city TEXT,
    state TEXT,
    country TEXT,
    private BOOLEAN,
    athlete_pr_effort summary_pr_segment_effort,
    athlete_segment_stats_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    total_elevation_gain REAL,
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
    average_cadence REAL,
    average_speed REAL,
    distance REAL,
    elapsed_time INT,
    start_index INT,
    end_index INT,
    lap_index INT,
    max_speed REAL,
    moving_time INT,
    name TEXT,
    pace_zone INT,
    split INT,
    start_date TIMESTAMP,
    start_date_local TIMESTAMP,
    total_elevation_gain REAL
);

CREATE TABLE activities (
    id BIGINT PRIMARY KEY,
    user_id SERIAL REFERENCES users(id),
    external_id TEXT,
    upload_id BIGINT,
    athlete meta_athlete,
    name TEXT,
    distance REAL,
    moving_time INT,
    elapsed_time INT,
    total_elevation_gain REAL,
    elev_high REAL,
    elev_low REAL,
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
    average_speed REAL,
    max_speed REAL,
    has_kudoed BOOLEAN,
    hide_from_home BOOLEAN,
    gear_id TEXT,
    kilojoules REAL,
    average_watts REAL,
    device_watts BOOLEAN,
    max_watts INT,
    weighted_average_watts INT,
    description TEXT,
    photos photos_summary,
    calories REAL,
    -- segment_efforts BIGINT[],
    device_name TEXT,
    embed_token TEXT
    -- splits_metric split[],
    -- splits_standard split[],
    -- laps BIGINT[],
    -- best_efforts BIGINT[]
);

COMMIT;
