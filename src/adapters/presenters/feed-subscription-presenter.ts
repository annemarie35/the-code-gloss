import { FeedSubscription } from '@/src/core/domain/feed/FeedSubscription'

export type FeedSubscriptionDto = {
    id: number
    url: string
    createdAt: string
}

export const toFeedSubscriptionDto = (subscription: FeedSubscription): FeedSubscriptionDto => ({
    id: subscription.id as number,
    url: subscription.url,
    createdAt: subscription.createdAt.toISOString()
})
