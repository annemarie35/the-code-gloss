import { describe, expect, it } from 'vitest'
import { toFeedSubscriptionDto } from '@/src/adapters/presenters/feed-subscription-presenter'

describe('toFeedSubscriptionDto', () => {
    it('should expose the id, the url and the creation date as an ISO string', () => {
        expect(
            toFeedSubscriptionDto({
                id: 3,
                url: 'https://blog.example.com/feed.xml',
                createdAt: new Date('2026-11-25T10:00:00.000Z')
            })
        ).toEqual({ id: 3, url: 'https://blog.example.com/feed.xml', createdAt: '2026-11-25T10:00:00.000Z' })
    })
})
