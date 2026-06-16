export const SELECT_ALL = (schema: string) => `SELECT * FROM ${schema}.gloses`

export const INSERT_GLOSE = (schema: string) => `INSERT INTO ${schema}.gloses
                                                                    (description, title, tags,created_at)
                                                                    VALUES ($1, $2, $3, $4)`

export const INSERT_PERSON = (schema: string) => `INSERT INTO ${schema}.people
    (first_name, last_name, nickname, blog_url, linkedin_url, biography, year_of_birth, tags, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

export const SELECT_ALL_PEOPLE = (schema: string) => `SELECT * FROM ${schema}.people`
