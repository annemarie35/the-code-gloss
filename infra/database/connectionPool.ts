import { Pool } from 'pg'

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    application_name: 'code-gloss',
    max: 6,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 0,
    allowExitOnIdle: false
})

export const query = (queryTextOrConfig: string, values?: never | string[]) => pool.query(queryTextOrConfig, values)
export const end = async () => await pool.end()
