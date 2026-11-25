// @vitest-environment node
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import pkg from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import INSERT_GLOSE, {
    DELETE_FEED_SUBSCRIPTION,
    INSERT_FEED_SUBSCRIPTION,
    INSERT_PERSON,
    SELECT_ALL,
    SELECT_ALL_FEED_SUBSCRIPTIONS,
    SELECT_ALL_PEOPLE,
    SELECT_FEED_SUBSCRIPTION_BY_URL
} from '@/infra/database/sql_queries'

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

        const sql = readFileSync(resolve('infra/database/scripts/migrations.sql'), 'utf-8')
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

    describe('Glose', () => {
        it('should insert a glose with its themes', async () => {
            const result = await pool.query(INSERT_GLOSE('public'), [
                'The fundamental idea of Event Sourcing is that...',
                'Event sourcing',
                'DDD, code',
                new Date().toISOString(),
                ['DDD', 'CRAFT']
            ])

            expect(result.rowCount).toBe(1)
        })

        it('should select all gloses with their themes', async () => {
            const result = await pool.query(SELECT_ALL('public'))

            const eventSourcing = result.rows.find((row) => row.title === 'Event sourcing')

            expect(eventSourcing?.themes).toEqual(['DDD', 'CRAFT'])
        })
    })

    describe('Feed subscription', () => {
        const url = 'https://blog.example.com/feed.xml'

        it('should insert a feed subscription and return it', async () => {
            const createdAt = '2026-11-25T10:00:00.000Z'

            const result = await pool.query(INSERT_FEED_SUBSCRIPTION('public'), [url, createdAt])

            expect(result.rows).toEqual([{ id: expect.any(Number), url, created_at: new Date(createdAt) }])
        })

        it('should refuse a second subscription with the same url', async () => {
            await expect(
                pool.query(INSERT_FEED_SUBSCRIPTION('public'), [url, new Date().toISOString()])
            ).rejects.toThrow(/duplicate key/)
        })

        it('should refuse a subscription without url', async () => {
            await expect(
                pool.query(INSERT_FEED_SUBSCRIPTION('public'), [null, new Date().toISOString()])
            ).rejects.toThrow(/null value/)
        })

        it('should select a feed subscription by url', async () => {
            const result = await pool.query(SELECT_FEED_SUBSCRIPTION_BY_URL('public'), [url])

            expect(result.rows).toHaveLength(1)
            expect(result.rows[0].url).toBe(url)
        })

        it('should select all feed subscriptions ordered by creation', async () => {
            const otherUrl = 'https://other.example.com/atom.xml'
            await pool.query(INSERT_FEED_SUBSCRIPTION('public'), [otherUrl, '2026-11-26T10:00:00.000Z'])

            const result = await pool.query(SELECT_ALL_FEED_SUBSCRIPTIONS('public'))

            expect(result.rows.map((row) => row.url)).toEqual([url, otherUrl])
        })

        it('should delete a feed subscription by id', async () => {
            const { rows } = await pool.query(SELECT_FEED_SUBSCRIPTION_BY_URL('public'), [url])

            const result = await pool.query(DELETE_FEED_SUBSCRIPTION('public'), [rows[0].id])

            expect(result.rowCount).toBe(1)
            const remaining = await pool.query(SELECT_FEED_SUBSCRIPTION_BY_URL('public'), [url])
            expect(remaining.rows).toHaveLength(0)
        })
    })
})
