import { PersistedFeedSubscription } from '@/src/core/domain/feed/FeedSubscription'
import { FeedAlreadySubscribedError } from '@/src/core/domain/feed/feed-errors'
import { FeedSubscriptionRepository } from '@/src/core/ports/feed-subscription-repository'

export const inMemoryFeedSubscriptionRepository = (
    initial: PersistedFeedSubscription[] = []
): FeedSubscriptionRepository & { subscriptions: PersistedFeedSubscription[] } => {
    const subscriptions = [...initial]
    let nextId = subscriptions.reduce((max, s) => Math.max(max, s.id), 0) + 1
    return {
        subscriptions,
        async save(subscription) {
            // Same as the UNIQUE constraint on feed_subscriptions.url
            if (subscriptions.some((s) => s.url === subscription.url)) {
                throw new FeedAlreadySubscribedError(subscription.url)
            }
            const saved = { ...subscription, id: nextId++ }
            subscriptions.push(saved)
            return saved
        },
        async findAll() {
            return [...subscriptions]
        },
        async findByUrl(url) {
            return subscriptions.find((s) => s.url === url) ?? null
        },
        async delete(id) {
            const index = subscriptions.findIndex((s) => s.id === id)
            if (index !== -1) subscriptions.splice(index, 1)
        }
    }
}

export const fixedClock = (date: Date) => ({ now: () => date })
