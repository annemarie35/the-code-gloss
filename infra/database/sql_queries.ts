export const SELECT_ALL = (schema: string) => `SELECT * FROM ${schema}.gloses`

const INSERT_GLOSE = (schema: string) => `INSERT INTO ${schema}.gloses
                                                                    (description, title, tags, created_at, themes)
                                                                    VALUES ($1, $2, $3, $4, $5)`
export default INSERT_GLOSE

export const INSERT_PERSON = (schema: string) => `INSERT INTO ${schema}.people
    (first_name, last_name, nickname, blog_url, linkedin_url, biography, year_of_birth, tags, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

export const SELECT_ALL_PEOPLE = (schema: string) => `SELECT * FROM ${schema}.people`

export const DELETE_PERSON = (schema: string) => `DELETE FROM ${schema}.people WHERE id = $1`

export const INSERT_FEED_SUBSCRIPTION = (schema: string) => `INSERT INTO ${schema}.feed_subscriptions
    (url, created_at)
    VALUES ($1, $2)
    RETURNING id, url, created_at`

export const SELECT_ALL_FEED_SUBSCRIPTIONS = (schema: string) =>
    `SELECT id, url, created_at FROM ${schema}.feed_subscriptions ORDER BY created_at, id`

export const SELECT_FEED_SUBSCRIPTION_BY_URL = (schema: string) =>
    `SELECT id, url, created_at FROM ${schema}.feed_subscriptions WHERE url = $1`

export const SELECT_FEED_SUBSCRIPTION_BY_ID = (schema: string) =>
    `SELECT id, url, created_at FROM ${schema}.feed_subscriptions WHERE id = $1`

export const DELETE_FEED_SUBSCRIPTION = (schema: string) => `DELETE FROM ${schema}.feed_subscriptions WHERE id = $1`
