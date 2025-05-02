import pkg from 'pg'
const { Pool } = pkg

export const pgConnectionPool = new Pool({
    host: process.env.POSTGRESQL_HOST,
    port: Number(process.env.POSTGRESQL_PORT),
    database: process.env.POSTGRESQL_DATABASE,
    user: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    application_name: 'code-gloss',
    max: 6,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 0,
    allowExitOnIdle: false
})

export const query: PgPoolQuery = (queryTextOrConfig: string, values: unknown[]) =>
    pgConnectionPool.query(queryTextOrConfig, values)

export type PgPoolQuery = (sqlQuery: string, values: unknown[]) => Promise<pkg.QueryResult<pkg.QueryResultRow>>
