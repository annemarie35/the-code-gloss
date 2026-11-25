import { describe, expect, it } from 'vitest'
import { FeedAlreadySubscribedError, InvalidFeedSubscriptionError } from '@/src/core/domain/feed/feed-errors'

describe('feed errors', () => {
    it('InvalidFeedSubscriptionError should carry its message and name', () => {
        const error = new InvalidFeedSubscriptionError('URL de flux invalide : x')

        expect(error).toBeInstanceOf(Error)
        expect(error.name).toBe('InvalidFeedSubscriptionError')
        expect(error.message).toBe('URL de flux invalide : x')
    })

    it('FeedAlreadySubscribedError should name the url already subscribed', () => {
        const error = new FeedAlreadySubscribedError('https://blog.example.com/feed.xml')

        expect(error).toBeInstanceOf(Error)
        expect(error.name).toBe('FeedAlreadySubscribedError')
        expect(error.message).toBe('Flux déjà ajouté : https://blog.example.com/feed.xml')
    })
})
