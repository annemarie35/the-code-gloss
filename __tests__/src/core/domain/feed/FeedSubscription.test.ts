import { describe, expect, it } from 'vitest'
import { createFeedSubscription } from '@/src/core/domain/feed/FeedSubscription'
import { InvalidFeedSubscriptionError } from '@/src/core/domain/feed/feed-errors'

describe('createFeedSubscription', () => {
    const now = new Date('2026-11-25T10:00:00.000Z')

    it('should create a subscription with the url and the creation date', () => {
        expect(createFeedSubscription('https://blog.example.com/feed.xml', now)).toEqual({
            url: 'https://blog.example.com/feed.xml',
            createdAt: now
        })
    })

    it('should accept an http url', () => {
        expect(createFeedSubscription('http://blog.example.com/rss', now).url).toBe('http://blog.example.com/rss')
    })

    it('should trim the url', () => {
        expect(createFeedSubscription('  https://blog.example.com/feed.xml \n', now).url).toBe(
            'https://blog.example.com/feed.xml'
        )
    })

    it.each([[''], ['   ']])('should refuse an empty url (%j)', (url) => {
        expect(() => createFeedSubscription(url, now)).toThrow(
            new InvalidFeedSubscriptionError("L'URL du flux est obligatoire")
        )
    })

    it('should refuse something that is not an url', () => {
        expect(() => createFeedSubscription('not an url', now)).toThrow(
            new InvalidFeedSubscriptionError('URL de flux invalide : not an url')
        )
    })

    it.each([['ftp://example.com/feed.xml'], ['file:///etc/passwd'], ['javascript:alert(1)']])(
        'should refuse a non http(s) url (%s)',
        (url) => {
            expect(() => createFeedSubscription(url, now)).toThrow(
                new InvalidFeedSubscriptionError('Seules les URLs http et https sont acceptées')
            )
        }
    )

    it('should refuse an url longer than 500 characters', () => {
        const url = `https://example.com/${'a'.repeat(481)}`

        expect(() => createFeedSubscription(url, now)).toThrow(
            new InvalidFeedSubscriptionError("L'URL du flux ne doit pas dépasser 500 caractères")
        )
    })

    it('should accept an url of exactly 500 characters', () => {
        const url = `https://example.com/${'a'.repeat(480)}`

        expect(createFeedSubscription(url, now).url).toHaveLength(500)
    })
})
