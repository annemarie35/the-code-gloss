import { describe, expect, it } from 'vitest'
import { readFeed } from '@/src/core/usecases/feeds/read-feed'
import { FeedSubscriptionNotFoundError, FeedUnavailableError } from '@/src/core/domain/feed/feed-errors'
import { inMemoryFeedSubscriptionRepository } from '@/__tests__/fakes/in-memory-feed-subscription-repository'
import { fakeFeedReader } from '@/__tests__/fakes/fake-feed-reader'

describe('readFeed', () => {
    const url = 'https://blog.example.com/feed.xml'
    const subscription = { id: 3, url, createdAt: new Date('2026-11-25T10:00:00.000Z') }
    const rss = `<rss><channel><title>Blog</title><item><title>Article</title><link>https://blog.example.com/1</link></item></channel></rss>`

    it('should read the feed of a subscription and parse it', async () => {
        const feedReader = fakeFeedReader({ [url]: rss })
        const read = readFeed({
            feedSubscriptionRepository: inMemoryFeedSubscriptionRepository([subscription]),
            feedReader
        })

        expect(await read(3)).toEqual({
            title: 'Blog',
            items: [{ title: 'Article', description: '', link: 'https://blog.example.com/1', pubDate: '' }]
        })
        expect(feedReader.readUrls).toEqual([url])
    })

    it('should refuse an unknown subscription without reading anything', async () => {
        const feedReader = fakeFeedReader({})
        const read = readFeed({ feedSubscriptionRepository: inMemoryFeedSubscriptionRepository(), feedReader })

        await expect(read(3)).rejects.toThrow(new FeedSubscriptionNotFoundError(3))
        expect(feedReader.readUrls).toEqual([])
    })

    it('should let the reader errors through', async () => {
        const read = readFeed({
            feedSubscriptionRepository: inMemoryFeedSubscriptionRepository([subscription]),
            feedReader: fakeFeedReader({})
        })

        await expect(read(3)).rejects.toBeInstanceOf(FeedUnavailableError)
    })
})
