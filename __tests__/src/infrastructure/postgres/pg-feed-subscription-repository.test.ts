// @vitest-environment node
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import pkg from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { pgFeedSubscriptionRepository } from '@/src/infrastructure/postgres/pg-feed-subscription-repository'
import { FeedSubscriptionRepository } from '@/src/core/ports/feed-subscription-repository'

const { Pool } = pkg

describe('pgFeedSubscriptionRepository', () => {
    let container: StartedPostgreSqlContainer
    let pool: InstanceType<typeof Pool>
    let repository: FeedSubscriptionRepository

    beforeAll(async () => {
        container = await new PostgreSqlContainer('postgres:16-alpine').start()
        pool = new Pool({
            host: container.getHost(),
            port: container.getPort(),
            database: container.getDatabase(),
            user: container.getUsername(),
            password: container.getPassword()
        })
        await pool.query(readFileSync(resolve('infra/database/scripts/migrations.sql'), 'utf-8'))
        repository = pgFeedSubscriptionRepository((sql, values) => pool.query(sql, values))
    }, 60_000)

    beforeEach(async () => {
        await pool.query('TRUNCATE feed_subscriptions RESTART IDENTITY')
    })

    afterAll(async () => {
        await pool?.end()
        await container?.stop()
    })

    const first = { url: 'https://a.example.com/feed.xml', createdAt: new Date('2026-11-24T10:00:00.000Z') }
    const second = { url: 'https://b.example.com/atom.xml', createdAt: new Date('2026-11-25T10:00:00.000Z') }

    it('should save a subscription and return it with its id', async () => {
        expect(await repository.save(first)).toEqual({ id: 1, ...first })
    })

    it('should find all subscriptions as entities, oldest first', async () => {
        await repository.save(second)
        await repository.save(first)

        expect(await repository.findAll()).toEqual([
            { id: 2, ...first },
            { id: 1, ...second }
        ])
    })

    it('should return an empty list when there is no subscription', async () => {
        expect(await repository.findAll()).toEqual([])
    })

    it('should find a subscription by url', async () => {
        await repository.save(first)

        expect(await repository.findByUrl(first.url)).toEqual({ id: 1, ...first })
    })

    it('should return null when no subscription has this url', async () => {
        expect(await repository.findByUrl('https://unknown.example.com/feed.xml')).toBeNull()
    })

    it('should delete a subscription by id', async () => {
        await repository.save(first)
        await repository.save(second)

        await repository.delete(1)

        expect(await repository.findAll()).toEqual([{ id: 2, ...second }])
    })
})
