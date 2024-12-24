BEGIN;

CREATE TYPE token_type AS ENUM (
    'Bearer'
);

CREATE TYPE activity_type as ENUM (
    'AlpineSki', 'BackcountrySki', 'Canoeing', 'Crossfit', 'EBikeRide',
    'Elliptical', 'Golf', 'Handcycle', 'Hike', 'IceSkate', 'InlineSkate',
    'Kayaking', 'Kitesurf', 'NordicSki', 'Ride', 'RockClimbing', 'RollerSki',
    'Rowing', 'Run', 'Sail', 'Skateboard', 'Snowboard', 'Snowshoe', 'Soccer',
    'StairStepper', 'StandUpPaddling', 'Surfing', 'Swim', 'Velomobile',
    'VirtualRide', 'VirtualRun', 'Walk', 'WeightTraining', 'Wheelchair',
    'Windsurf', 'Workout', 'Yoga'
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

CREATE TYPE meta_athlete AS (
    id BIGINT
);

CREATE TYPE meta_activity AS (
    id BIGINT
);

CREATE TYPE athlete AS (
    id BIGINT,
    resource_state INT
);

CREATE TYPE photos_summary_primary AS (
    id BIGINT,
    source INT,
    unique_id TEXT,
    urls TEXT
);

CREATE TYPE photos_summary AS (
    count int,
    photo_primary photos_summary_primary
);

CREATE TYPE summary_pr_segment_effort AS (
    pr_activity_id BIGINT,
    pr_elapsed_time INT,
    pr_date TIMESTAMP,
    effort_count INT
);

CREATE TYPE split AS (
    average_speed REAL,
    distance REAL,
    elapsed_time INT,
    elevation_difference REAL,
    pace_zone INT,
    moving_time INT,
    split INT
);

-- CREATE TYPE summary_segment AS (
--     id BIGINT,
--     name TEXT,
--     activity_type TEXT,
--     distance REAL,
--     average_grade REAL,
--     maximum_grade REAL,
--     elevation_high REAL,
--     elevation_low REAL,
--     start_latlng POINT,
--     end_latlng POINT,
--     climb_category INT,
--     city TEXT,
--     state TEXT,
--     country TEXT,
--     private BOOLEAN,
--     athlete_pr_effort summary_pr_segment_effort,
--     athlete_segment_stats summary_segment_effort
-- );

-- CREATE TYPE detailed_segment_effort AS (
--     id BIGINT,
--     activity_id BIGINT,
--     elapsed_time INT,
--     start_date TIMESTAMP,
--     start_date_local TIMESTAMP,
--     distance REAL,
--     is_kom BOOLEAN,
--     name TEXT,
--     activity meta_activity,
--     athlete meta_athlete,
--     moving_time INT,
--     start_index INT,
--     end_index INT,
--     average_cadence REAL,
--     average_watts REAL,
--     device_watts BOOLEAN,
--     average_heartrate REAL,
--     max_heartrate REAL,
--     segment summary_segment,
--     kom_rank INT,
--     pr_rank INT,
--     hidden BOOLEAN
-- );

-- CREATE TYPE lap AS (
--     id BIGINT,
--     activity meta_activity,
--     athlete meta_athlete,
--     average_cadence REAL,
--     average_speed REAL,
--     distance REAL,
--     elapsed_time INT,
--     start_index INT,
--     end_index INT,
--     lap_index INT,
--     max_speed REAL,
--     moving_time INT,
--     name TEXT,
--     pace_zone INT,
--     split INT,
--     start_date TIMESTAMP,
--     start_date_local TIMESTAMP,
--     total_elevation_gain REAL
-- );

-- CREATE TYPE summary_club as (
--     id BIGINT,
--     resource_state INT,
--     name TEXT,
--     profile_medium TEXT,
--     cover_photo TEXT,
--     cover_photo_small TEXT,
--     sport_type TEXT,
--     activity_types activity_type[],
--     city TEXT,
--     state TEXT,
--     country TEXT,
--     private BOOLEAN,
--     member_count INT,
--     featured BOOLEAN,
--     verified BOOLEAN,
--     url TEXT
-- );

COMMIT;
