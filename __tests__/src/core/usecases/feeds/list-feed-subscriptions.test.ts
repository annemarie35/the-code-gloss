import { describe, expect, it } from 'vitest'
import { listFeedSubscriptions } from '@/src/core/usecases/feeds/list-feed-subscriptions'
import { inMemoryFeedSubscriptionRepository } from '@/__tests__/fakes/in-memory-feed-subscription-repository'

describe('listFeedSubscriptions', () => {
    it('should return every subscription', async () => {
        const subscriptions = [
            { id: 1, url: 'https://a.example.com/feed.xml', createdAt: new Date('2026-11-24T10:00:00.000Z') },
            { id: 2, url: 'https://b.example.com/atom.xml', createdAt: new Date('2026-11-25T10:00:00.000Z') }
        ]
        const list = listFeedSubscriptions({
            feedSubscriptionRepository: inMemoryFeedSubscriptionRepository(subscriptions)
        })

        expect(await list()).toEqual(subscriptions)
    })

    it('should return an empty list when there is no subscription', async () => {
        const list = listFeedSubscriptions({ feedSubscriptionRepository: inMemoryFeedSubscriptionRepository() })

        expect(await list()).toEqual([])
    })
})
