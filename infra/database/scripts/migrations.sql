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

CREATE TABLE IF NOT EXISTS urls
(
    id          SERIAL                   NOT NULL PRIMARY KEY,
    url         VARCHAR(500),
    description TEXT,
    tags        VARCHAR(200),
    themes      text[]                   DEFAULT '{}',
    created_at  TIMESTAMP WITH TIME ZONE
);

