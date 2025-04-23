export const SELECT_ALL = (schema: string) => `SELECT * FROM ${schema}.gloses`

export const INSERT_GLOSE = (schema: string) => `INSERT INTO ${schema}.gloses
                                                                    (description, title, tags,created_at)
                                                                    VALUES ($1, $2, $3, $4)`
