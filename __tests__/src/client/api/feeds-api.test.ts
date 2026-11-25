import { describe, expect, it, vi } from 'vitest'
import { getFeed, listFeedSubscriptions, subscribeToFeed, unsubscribeFromFeed } from '@/src/client/api/feeds-api'
import { Feed } from '@/src/core/domain/models/Feed'

const feed: Feed = {
    title: 'Test Feed',
    items: [
        {
            title: 'Article 1',
            description: 'Description 1',
            link: 'https://example.com/1',
            pubDate: 'Mon, 01 Jan 2025 00:00:00 UTC'
        }
    ]
}
const subscription = { id: 1, url: 'https://example.com/feed.xml', createdAt: '2026-11-25T10:00:00.000Z' }

const mockFetchOk = (body: unknown) => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(body) })
}
const mockFetchStatus = (status: number) => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status, json: () => Promise.resolve({}) })
}
const mockNetworkError = () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))
}

describe('Feeds API client', () => {
    describe('getFeed', () => {
        it('should return the feed on success', async () => {
            mockFetchOk(feed)

            const response = await getFeed('https://example.com/feed.xml')

            expect(response).toEqual({ feed, error: null })
            expect(fetch).toHaveBeenCalledWith(
                '/api/feeds?url=https%3A%2F%2Fexample.com%2Ffeed.xml',
                expect.objectContaining({ method: 'GET', mode: 'cors' })
            )
        })

        it('should return an error message on network error', async () => {
            mockNetworkError()

            expect(await getFeed('https://example.com/feed.xml')).toEqual({
                feed: null,
                error: 'Une erreur est survenue en récupérant le flux'
            })
        })
    })

    describe('listFeedSubscriptions', () => {
        it('should return the saved subscriptions', async () => {
            mockFetchOk({ message: 'Voici vos flux', subscriptions: [subscription] })

            const response = await listFeedSubscriptions()

            expect(response).toEqual({ subscriptions: [subscription], error: null })
            expect(fetch).toHaveBeenCalledWith('/api/feeds', expect.objectContaining({ method: 'GET', mode: 'cors' }))
        })

        it('should return an empty list and an error message when the request fails', async () => {
            mockFetchStatus(500)

            expect(await listFeedSubscriptions()).toEqual({
                subscriptions: [],
                error: 'Une erreur est survenue en récupérant vos flux'
            })
        })
    })

    describe('subscribeToFeed', () => {
        it('should post the url and return the created subscription', async () => {
            mockFetchOk({ message: 'Flux ajouté avec succès', subscription })

            const response = await subscribeToFeed('https://example.com/feed.xml')

            expect(response).toEqual({ subscription, error: null })
            expect(fetch).toHaveBeenCalledWith(
                '/api/feeds',
                expect.objectContaining({
                    method: 'POST',
                    mode: 'cors',
                    body: JSON.stringify({ url: 'https://example.com/feed.xml' })
                })
            )
        })

        it('should return an error message when the request fails', async () => {
            mockFetchStatus(409)

            expect(await subscribeToFeed('https://example.com/feed.xml')).toEqual({
                subscription: null,
                error: "Une erreur est survenue dans l'ajout du flux"
            })
        })
    })

    describe('unsubscribeFromFeed', () => {
        it('should delete the subscription by id', async () => {
            mockFetchOk({ message: 'Flux supprimé avec succès' })

            const response = await unsubscribeFromFeed(12)

            expect(response).toEqual({ error: null })
            expect(fetch).toHaveBeenCalledWith(
                '/api/feeds?id=12',
                expect.objectContaining({ method: 'DELETE', mode: 'cors' })
            )
        })

        it('should return an error message when the request fails', async () => {
            mockNetworkError()

            expect(await unsubscribeFromFeed(12)).toEqual({
                error: 'Une erreur est survenue dans la suppression du flux'
            })
        })
    })
})
