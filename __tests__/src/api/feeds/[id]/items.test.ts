import handler from '@/src/pages/api/feeds/[id]/items'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as rateLimiterMod from '@/src/lib/rate-limiter'
import { container } from '@/src/composition/container'
import { createMockApiResponse } from '@/__tests__/test-helpers.ts'

vi.mock('@/src/lib/rate-limiter', () => ({
    rateLimit: vi.fn().mockReturnValue(true),
    getIp: vi.fn().mockReturnValue('127.0.0.1')
}))
vi.mock('@/src/composition/container', () => ({
    container: { feedsController: { items: vi.fn() } }
}))

describe('Feed items API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should delegate GET to the controller', async () => {
        const { res } = createMockApiResponse()
        const req = { method: 'GET', query: { id: '3' } }

        // @ts-expect-error -- partial request mock
        await handler(req, res)

        expect(container.feedsController.items).toHaveBeenCalledWith(req, res)
    })

    it('should apply the read limit', async () => {
        const rateLimitSpy = vi.spyOn(rateLimiterMod, 'rateLimit').mockReturnValueOnce(false)
        const { res, json } = createMockApiResponse()

        // @ts-expect-error -- partial request mock
        await handler({ method: 'GET', query: { id: '3' } }, res)

        expect(rateLimitSpy).toHaveBeenCalledWith('127.0.0.1', 30, 60_000)
        expect(container.feedsController.items).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(429)
        expect(json).toHaveBeenCalledWith({ error: 'Too Many Requests' })
    })

    it.each([['POST'], ['DELETE'], ['PUT']])('should return 405 for %s', async (method) => {
        const { res, json } = createMockApiResponse()
        const setHeader = vi.fn()

        // @ts-expect-error -- partial request mock
        await handler({ method, query: { id: '3' } }, { ...res, setHeader })

        expect(setHeader).toHaveBeenCalledWith('Allow', 'GET')
        expect(res.status).toHaveBeenCalledWith(405)
        expect(json).toHaveBeenCalledWith({ error: 'Method Not Allowed' })
        expect(container.feedsController.items).not.toHaveBeenCalled()
    })
})
