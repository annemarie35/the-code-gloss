-- This sql scripts are used at db creation with Docker
CREATE TABLE IF NOT EXISTS people
(
    id               SERIAL                   NOT NULL PRIMARY KEY,
    first_name       VARCHAR(100),
    last_name        VARCHAR(100),
    nickname         VARCHAR(100),
    blog_url         VARCHAR(500),
    linkedin_url     VARCHAR(500),
    biography        TEXT,
    year_of_birth    SMALLINT,
    tags             VARCHAR(200),
    created_at       TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS gloses
(
    id                        SERIAL             not null primary key,
    description                      varchar(500),
    title                            varchar(100),
    tags                             varchar(200),
    created_at                timestamp with time zone
);

ALTER TABLE gloses
    ADD COLUMN IF NOT EXISTS themes text[] DEFAULT '{}';

-- Keep in sync with THEMES in src/core/domain/models/Glose.ts
-- One DO block = one statement: if ADD fails on existing rows, the DROP is rolled back too
DO $$
BEGIN
    ALTER TABLE gloses
        DROP CONSTRAINT IF EXISTS gloses_themes_check;
    -- SOFTWARE ENGINEERING was first stored with a space
    UPDATE gloses
    SET themes = array_replace(themes, 'SOFTWARE ENGINEERING', 'SOFTWARE_ENGINEERING')
    WHERE 'SOFTWARE ENGINEERING' = ANY (themes);
    ALTER TABLE gloses
        ADD CONSTRAINT gloses_themes_check
            CHECK (themes <@ ARRAY['OPS', 'CRAFT', 'DATABASE', 'DDD', 'AGILE', 'DESIGN', 'TEST', 'WEB', 'ARCHITECTURE', 'SOFTWARE_ENGINEERING']::text[]);
END
$$;

CREATE TABLE IF NOT EXISTS urls
(
    id          SERIAL                   NOT NULL PRIMARY KEY,
    url         VARCHAR(500),
    description TEXT,
    tags        VARCHAR(200),
    themes      text[]                   DEFAULT '{}',
    created_at  TIMESTAMP WITH TIME ZONE
);


CREATE TABLE IF NOT EXISTS feed_subscriptions
(
    id          SERIAL                   NOT NULL PRIMARY KEY,
    url         VARCHAR(500)             NOT NULL UNIQUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL
);
