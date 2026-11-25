import { PersistedFeedSubscription } from '@/src/core/domain/feed/FeedSubscription'

export type FeedSubscriptionDto = {
    id: number
    url: string
    createdAt: string
}

export const toFeedSubscriptionDto = (subscription: PersistedFeedSubscription): FeedSubscriptionDto => ({
    id: subscription.id,
    url: subscription.url,
    createdAt: subscription.createdAt.toISOString()
})
