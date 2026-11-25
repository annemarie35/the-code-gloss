import { describe, expect, it } from 'vitest'
import {
    FeedAlreadySubscribedError,
    FeedUnavailableError,
    InvalidFeedSubscriptionError
} from '@/src/core/domain/feed/feed-errors'

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

    it('FeedUnavailableError should name the url and keep the reason for the logs', () => {
        const error = new FeedUnavailableError('https://blog.example.com/feed.xml', 'adresse interdite : 10.0.0.1')

        expect(error).toBeInstanceOf(Error)
        expect(error.name).toBe('FeedUnavailableError')
        expect(error.message).toBe('Flux inaccessible : https://blog.example.com/feed.xml')
        expect(error.reason).toBe('adresse interdite : 10.0.0.1')
    })
})
