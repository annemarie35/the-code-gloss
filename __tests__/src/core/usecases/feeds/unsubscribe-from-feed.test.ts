import { describe, expect, it } from 'vitest'
import { unsubscribeFromFeed } from '@/src/core/usecases/feeds/unsubscribe-from-feed'
import { inMemoryFeedSubscriptionRepository } from '@/__tests__/fakes/in-memory-feed-subscription-repository'

describe('unsubscribeFromFeed', () => {
    const a = { id: 1, url: 'https://a.example.com/feed.xml', createdAt: new Date('2026-11-24T10:00:00.000Z') }
    const b = { id: 2, url: 'https://b.example.com/atom.xml', createdAt: new Date('2026-11-25T10:00:00.000Z') }

    it('should delete only the subscription with this id', async () => {
        const feedSubscriptionRepository = inMemoryFeedSubscriptionRepository([a, b])

        await unsubscribeFromFeed({ feedSubscriptionRepository })(1)

        expect(feedSubscriptionRepository.subscriptions).toEqual([b])
    })

    it('should do nothing when the id does not exist', async () => {
        const feedSubscriptionRepository = inMemoryFeedSubscriptionRepository([a])

        await unsubscribeFromFeed({ feedSubscriptionRepository })(42)

        expect(feedSubscriptionRepository.subscriptions).toEqual([a])
    })
})
