import { describe, expect, it } from 'vitest'
import { subscribeToFeed } from '@/src/core/usecases/feeds/subscribe-to-feed'
import { FeedAlreadySubscribedError, InvalidFeedSubscriptionError } from '@/src/core/domain/feed/feed-errors'
import {
    fixedClock,
    inMemoryFeedSubscriptionRepository
} from '@/__tests__/fakes/in-memory-feed-subscription-repository'

describe('subscribeToFeed', () => {
    const now = new Date('2026-11-25T10:00:00.000Z')

    it('should save the subscription with the current date and return it with its id', async () => {
        const feedSubscriptionRepository = inMemoryFeedSubscriptionRepository()
        const subscribe = subscribeToFeed({ feedSubscriptionRepository, clock: fixedClock(now) })

        const subscription = await subscribe(' https://blog.example.com/feed.xml ')

        expect(subscription).toEqual({ id: 1, url: 'https://blog.example.com/feed.xml', createdAt: now })
        expect(feedSubscriptionRepository.subscriptions).toEqual([subscription])
    })

    it('should refuse an url already subscribed', async () => {
        const existing = { id: 7, url: 'https://blog.example.com/feed.xml', createdAt: now }
        const feedSubscriptionRepository = inMemoryFeedSubscriptionRepository([existing])
        const subscribe = subscribeToFeed({ feedSubscriptionRepository, clock: fixedClock(now) })

        await expect(subscribe('https://blog.example.com/feed.xml ')).rejects.toThrow(
            new FeedAlreadySubscribedError('https://blog.example.com/feed.xml')
        )
        expect(feedSubscriptionRepository.subscriptions).toEqual([existing])
    })

    it('should not save an invalid url', async () => {
        const feedSubscriptionRepository = inMemoryFeedSubscriptionRepository()
        const subscribe = subscribeToFeed({ feedSubscriptionRepository, clock: fixedClock(now) })

        await expect(subscribe('ftp://example.com/feed.xml')).rejects.toBeInstanceOf(InvalidFeedSubscriptionError)
        expect(feedSubscriptionRepository.subscriptions).toEqual([])
    })

    it('should store the normalized url', async () => {
        const feedSubscriptionRepository = inMemoryFeedSubscriptionRepository()
        const subscribe = subscribeToFeed({ feedSubscriptionRepository, clock: fixedClock(now) })

        expect((await subscribe('HTTPS://Blog.Example.com')).url).toBe('https://blog.example.com/')
    })

    it('should refuse an url equivalent to one already subscribed', async () => {
        const existing = { id: 7, url: 'https://blog.example.com/', createdAt: now }
        const feedSubscriptionRepository = inMemoryFeedSubscriptionRepository([existing])
        const subscribe = subscribeToFeed({ feedSubscriptionRepository, clock: fixedClock(now) })

        await expect(subscribe('https://Blog.Example.com:443')).rejects.toBeInstanceOf(FeedAlreadySubscribedError)
    })
})
