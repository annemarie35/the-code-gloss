import { describe, expect, it, vi } from 'vitest'
import { getFeed } from '@/src/actions/feeds-actions'
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

describe('Feeds actions', () => {
    describe('getFeed', () => {
        it('should return the feed on success', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(feed)
            })

            const response = await getFeed('https://example.com/feed.xml')

            expect(response).toEqual({ feed, error: null })
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/feeds?url=https%3A%2F%2Fexample.com%2Ffeed.xml',
                expect.objectContaining({ method: 'GET', mode: 'cors' })
            )
        })

        describe('with network error', () => {
            it('should return an error message', async () => {
                global.fetch = vi.fn().mockRejectedValue(new Error('network error'))

                const response = await getFeed('https://example.com/feed.xml')

                expect(response).toEqual({
                    feed: null,
                    error: 'Une erreur est survenue en récupérant le flux'
                })
            })
        })
    })
})
