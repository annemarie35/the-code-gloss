import handler from '@/src/pages/api/feeds'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as rateLimiterMod from '@/src/lib/rate-limiter'
import { container } from '@/src/composition/container'
import { createMockApiResponse } from '@/__tests__/test-helpers.ts'

vi.mock('@/src/lib/rate-limiter', () => ({
    rateLimit: vi.fn().mockReturnValue(true),
    getIp: vi.fn().mockReturnValue('127.0.0.1')
}))
vi.mock('@/src/composition/container', () => ({
    container: { feedsController: { list: vi.fn(), subscribe: vi.fn(), unsubscribe: vi.fn() } }
}))

const validOriginHeaders = { origin: 'http://localhost:3000', host: 'localhost:3000' }

describe('Feeds API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('GET: list subscriptions', () => {
        it('should delegate to the controller', async () => {
            const { res } = createMockApiResponse()
            const req = { method: 'GET', query: {} }

            // @ts-expect-error -- partial request mock
            await handler(req, res)

            expect(container.feedsController.list).toHaveBeenCalledWith(req, res)
        })

        it('should no longer fetch the url given in the query: it only lists the subscriptions', async () => {
            const fetchSpy = vi.spyOn(globalThis, 'fetch')
            const { res } = createMockApiResponse()
            const req = { method: 'GET', query: { url: 'http://169.254.169.254/latest/meta-data/' } }

            // @ts-expect-error -- partial request mock
            await handler(req, res)

            expect(container.feedsController.list).toHaveBeenCalledWith(req, res)
            expect(fetchSpy).not.toHaveBeenCalled()
            fetchSpy.mockRestore()
        })

        it('should return 429 when the read limit is exceeded', async () => {
            const rateLimitSpy = vi.spyOn(rateLimiterMod, 'rateLimit').mockReturnValueOnce(false)
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request mock
            await handler({ method: 'GET', query: {} }, res)

            expect(rateLimitSpy).toHaveBeenCalledWith('127.0.0.1', 30, 60_000)
            expect(container.feedsController.list).not.toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(429)
            expect(json).toHaveBeenCalledWith({ error: 'Too Many Requests' })
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
