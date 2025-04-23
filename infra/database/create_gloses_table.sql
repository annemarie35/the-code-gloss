DROP TABLE IF EXISTS gloses;

CREATE TABLE IF NOT EXISTS gloses
(
    id                        SERIAL             not null primary key,
    description                      varchar(500),
    title                            varchar(100),
    tags                             varchar(200),
    created_at                timestamp with time zone
);