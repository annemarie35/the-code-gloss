import type { QueryResultRow } from 'pg'
import { FeedSubscription } from '@/src/core/domain/feed/FeedSubscription'
import { FeedSubscriptionRepository } from '@/src/core/ports/feed-subscription-repository'
import type { PgPoolQuery } from '@/infra/database/connectionPool'
import {
    DELETE_FEED_SUBSCRIPTION,
    INSERT_FEED_SUBSCRIPTION,
    SELECT_ALL_FEED_SUBSCRIPTIONS,
    SELECT_FEED_SUBSCRIPTION_BY_URL
} from '@/infra/database/sql_queries'

export const pgFeedSubscriptionRepository = (query: PgPoolQuery, schema = 'public'): FeedSubscriptionRepository => ({
    async save(subscription) {
        const { rows } = await query(INSERT_FEED_SUBSCRIPTION(schema), [
            subscription.url,
            subscription.createdAt.toISOString()
        ])
        return toFeedSubscription(rows[0])
    },
    async findAll() {
        const { rows } = await query(SELECT_ALL_FEED_SUBSCRIPTIONS(schema), [])
        return rows.map(toFeedSubscription)
    },
    async findByUrl(url) {
        const { rows } = await query(SELECT_FEED_SUBSCRIPTION_BY_URL(schema), [url])
        return rows.length ? toFeedSubscription(rows[0]) : null
    },
    async delete(id) {
        await query(DELETE_FEED_SUBSCRIPTION(schema), [id])
    }
})

const toFeedSubscription = (row: QueryResultRow): FeedSubscription => ({
    id: row.id as number,
    url: row.url as string,
    createdAt: new Date(row.created_at)
})
