BEGIN;

    CREATE TABLE clubs (
        id BIGINT PRIMARY KEY,
        resource_state INT,
        name TEXT,
        profile_medium TEXT,
        cover_photo TEXT,
        cover_photo_small TEXT,
        sport_type TEXT,
        activity_types activity_type[],
        city TEXT,
        state TEXT,
        country TEXT,
        private BOOLEAN,
        member_count INT,
        featured BOOLEAN,
        verified BOOLEAN,
        url TEXT,
        membership TEXT,
        admin BOOLEAN,
        owner BOOLEAN,
        following_count INT
    );

COMMIT;
