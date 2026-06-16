// @vitest-environment node
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import pkg from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { INSERT_PERSON, SELECT_ALL_PEOPLE } from '@/infra/database/sql_queries'

const { Pool } = pkg

describe('Sql Queries', () => {
    let container: StartedPostgreSqlContainer
    let pool: InstanceType<typeof Pool>

    beforeAll(async () => {
        container = await new PostgreSqlContainer('postgres:16-alpine').start()
        pool = new Pool({
            host: container.getHost(),
            port: container.getPort(),
            database: container.getDatabase(),
            user: container.getUsername(),
            password: container.getPassword()
        })

        const sql = readFileSync(resolve('infra/database/scripts/create_people_table.sql'), 'utf-8')
        await pool.query(sql)
    }, 60_000)

    afterAll(async () => {
        await pool?.end()
        await container?.stop()
    })

    describe('Person', () => {
        it('should insert a person', async () => {
            const result = await pool.query(INSERT_PERSON('public'), [
                'Ada',
                'Lovelace',
                'ada_codes',
                'https://ada.dev',
                'https://linkedin.com/in/ada',
                'First programmer',
                1815,
                'pioneer, math',
                new Date().toISOString()
            ])

            expect(result.rowCount).toBe(1)
        })

        it('should select all people', async () => {
            const result = await pool.query(SELECT_ALL_PEOPLE('public'))

            expect(result.rows.length).toBeGreaterThanOrEqual(1)
        })
    })
})
