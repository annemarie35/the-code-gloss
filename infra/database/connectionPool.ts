import { Pool } from 'pg'

const pool = new Pool({
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

export const query = (queryTextOrConfig: string, values?: never | string[]) => pool.query(queryTextOrConfig, values)
export const end = async () => await pool.end()
// TODO use end when app is shut down
