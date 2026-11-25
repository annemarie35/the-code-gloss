import handler from '@/src/pages/api/feeds'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as getFeedsMod from '@/src/lib/service/get-feeds'
import * as rateLimiterMod from '@/src/lib/rate-limiter'
import { container } from '@/src/composition/container'
import { Feed } from '@/src/core/domain/models/Feed'
import { createMockApiResponse } from '@/__tests__/test-helpers.ts'

vi.mock('@/src/lib/service/get-feeds')
vi.mock('@/src/lib/rate-limiter', () => ({
    rateLimit: vi.fn().mockReturnValue(true),
    getIp: vi.fn().mockReturnValue('127.0.0.1')
}))
vi.mock('@/src/composition/container', () => ({
    container: { feedsController: { list: vi.fn(), subscribe: vi.fn(), unsubscribe: vi.fn() } }
}))

const mockFeed: Feed = {
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

const validOriginHeaders = { origin: 'http://localhost:3000', host: 'localhost:3000' }

describe('Feeds API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('GET with url: read a feed content', () => {
        it('should return 200 with feed data', async () => {
            const getFeedSpy = vi.spyOn(getFeedsMod, 'getFeedFromUrl').mockResolvedValue(mockFeed)
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request mock
            await handler({ method: 'GET', query: { url: 'https://example.com/feed.xml' } }, res)

            expect(getFeedSpy).toHaveBeenCalledWith('https://example.com/feed.xml')
            expect(container.feedsController.list).not.toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(json).toHaveBeenCalledWith(mockFeed)
        })

        it('should accept an http url', async () => {
            vi.spyOn(getFeedsMod, 'getFeedFromUrl').mockResolvedValue(mockFeed)
            const { res } = createMockApiResponse()

            // @ts-expect-error -- partial request mock
            await handler({ method: 'GET', query: { url: 'http://example.com/feed.xml' } }, res)

            expect(res.status).toHaveBeenCalledWith(200)
        })

        it('should return 400 when url is empty', async () => {
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request mock
            await handler({ method: 'GET', query: { url: '' } }, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(json).toHaveBeenCalledWith({ error: 'Missing url parameter' })
        })

        it('should return 400 when url is given several times', async () => {
            const { res, json } = createMockApiResponse()

            await handler(
                // @ts-expect-error -- partial request mock
                { method: 'GET', query: { url: ['https://example.com/a.xml', 'https://example.com/b.xml'] } },
                res
            )

            expect(res.status).toHaveBeenCalledWith(400)
            expect(json).toHaveBeenCalledWith({ error: 'Missing url parameter' })
        })

        it('should return 400 when url is invalid', async () => {
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request mock
            await handler({ method: 'GET', query: { url: 'not-a-url' } }, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(json).toHaveBeenCalledWith({ error: 'Invalid URL' })
        })

        it('should return 400 when protocol is not http or https', async () => {
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request mock
            await handler({ method: 'GET', query: { url: 'ftp://example.com/feed.xml' } }, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(json).toHaveBeenCalledWith({ error: 'Invalid URL protocol' })
        })

        it('should return 502 when the service throws', async () => {
            vi.spyOn(getFeedsMod, 'getFeedFromUrl').mockRejectedValue(new Error('fetch failed'))
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request mock
            await handler({ method: 'GET', query: { url: 'https://example.com/feed.xml' } }, res)

            expect(res.status).toHaveBeenCalledWith(502)
            expect(json).toHaveBeenCalledWith({ error: 'Failed to fetch feed' })
        })
    })

    describe('GET without url: list subscriptions', () => {
        it('should delegate to the controller', async () => {
            const { res } = createMockApiResponse()
            const req = { method: 'GET', query: {} }

            // @ts-expect-error -- partial request mock
            await handler(req, res)

            expect(container.feedsController.list).toHaveBeenCalledWith(req, res)
            expect(getFeedsMod.getFeedFromUrl).not.toHaveBeenCalled()
        })
    })

    describe('POST: subscribe to a feed', () => {
        it('should delegate to the controller when the origin is valid', async () => {
            const { res } = createMockApiResponse()
            const req = { method: 'POST', headers: validOriginHeaders, query: {}, body: '{"url":"https://a.b/c"}' }

            // @ts-expect-error -- partial request mock
            await handler(req, res)

            expect(container.feedsController.subscribe).toHaveBeenCalledWith(req, res)
        })

        it('should return 403 when the origin does not match the host', async () => {
            const { res, json } = createMockApiResponse()
            const req = { method: 'POST', headers: { host: 'localhost:3000' }, query: {}, body: '{}' }

            // @ts-expect-error -- partial request mock
            await handler(req, res)

            expect(container.feedsController.subscribe).not.toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(403)
            expect(json).toHaveBeenCalledWith({ error: 'Forbidden' })
        })
    })

    describe('DELETE: unsubscribe from a feed', () => {
        it('should delegate to the controller when the origin is valid', async () => {
            const { res } = createMockApiResponse()
            const req = { method: 'DELETE', headers: validOriginHeaders, query: { id: '1' } }

            // @ts-expect-error -- partial request mock
            await handler(req, res)

            expect(container.feedsController.unsubscribe).toHaveBeenCalledWith(req, res)
        })

        it('should return 403 when the origin does not match the host', async () => {
            const { res, json } = createMockApiResponse()
            const req = {
                method: 'DELETE',
                headers: { origin: 'http://evil.example.com', host: 'localhost:3000' },
                query: { id: '1' }
            }

            // @ts-expect-error -- partial request mock
            await handler(req, res)

            expect(container.feedsController.unsubscribe).not.toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(403)
            expect(json).toHaveBeenCalledWith({ error: 'Forbidden' })
        })
    })

    describe('rate limiting', () => {
        it('should return 429 when the read limit is exceeded', async () => {
            const rateLimitSpy = vi.spyOn(rateLimiterMod, 'rateLimit').mockReturnValueOnce(false)
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request mock
            await handler({ method: 'GET', query: { url: 'https://example.com/feed.xml' } }, res)

            expect(rateLimitSpy).toHaveBeenCalledWith('127.0.0.1', 30, 60_000)
            expect(res.status).toHaveBeenCalledWith(429)
            expect(json).toHaveBeenCalledWith({ error: 'Too Many Requests' })
        })

        it.each([['POST'], ['DELETE']])('should apply the write limit to %s', async (method) => {
            const rateLimitSpy = vi.spyOn(rateLimiterMod, 'rateLimit').mockReturnValueOnce(false)
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request mock
            await handler({ method, headers: validOriginHeaders, query: {} }, res)

            expect(rateLimitSpy).toHaveBeenCalledWith('127.0.0.1', 10, 60_000)
            expect(container.feedsController.subscribe).not.toHaveBeenCalled()
            expect(container.feedsController.unsubscribe).not.toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(429)
            expect(json).toHaveBeenCalledWith({ error: 'Too Many Requests' })
        })
    })

    it('should return 405 with the allowed methods for any other method', async () => {
        const { res, json } = createMockApiResponse()
        const setHeader = vi.fn()

        // @ts-expect-error -- partial request mock
        await handler({ method: 'PUT', query: {} }, { ...res, setHeader })

        expect(setHeader).toHaveBeenCalledWith('Allow', 'GET, POST, DELETE')
        expect(res.status).toHaveBeenCalledWith(405)
        expect(json).toHaveBeenCalledWith({ error: 'Method Not Allowed' })
    })
})
