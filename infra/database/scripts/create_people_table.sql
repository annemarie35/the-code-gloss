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
