import handler from '@/src/pages/api/feeds'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import * as getFeedsMod from '@/src/lib/service/get-feeds'
import * as rateLimiterMod from '@/src/lib/rate-limiter'
import { Feed } from '@/src/core/domain/models/Feed'

vi.mock('@/src/lib/service/get-feeds')
vi.mock('@/src/lib/rate-limiter', () => ({
    rateLimit: vi.fn().mockReturnValue(true),
    getIp: vi.fn().mockReturnValue('127.0.0.1')
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

describe('Feeds API', () => {
    let res: { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> }

    beforeEach(() => {
        const json = vi.fn()
        res = {
            status: vi.fn().mockReturnValue({ json }),
            json
        }
    })

    it('should return 200 with feed data', async () => {
        vi.spyOn(getFeedsMod, 'getFeedFromUrl').mockResolvedValue(mockFeed)

        // @ts-expect-error -- partial request mock
        await handler({ query: { url: 'https://example.com/feed.xml' } }, res)

        expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return 400 when url is missing', async () => {
        // @ts-expect-error -- partial request mock
        await handler({ query: {} }, res)

        expect(res.status).toHaveBeenCalledWith(400)
    })

    it('should return 400 when url is invalid', async () => {
        // @ts-expect-error -- partial request mock
        await handler({ query: { url: 'not-a-url' } }, res)

        expect(res.status).toHaveBeenCalledWith(400)
    })

    it('should return 400 when protocol is not http or https', async () => {
        // @ts-expect-error -- partial request mock
        await handler({ query: { url: 'ftp://example.com/feed.xml' } }, res)

        expect(res.status).toHaveBeenCalledWith(400)
    })

    it('should return 502 when the service throws', async () => {
        vi.spyOn(getFeedsMod, 'getFeedFromUrl').mockRejectedValue(new Error('fetch failed'))

        // @ts-expect-error -- partial request mock
        await handler({ query: { url: 'https://example.com/feed.xml' } }, res)

        expect(res.status).toHaveBeenCalledWith(502)
    })

    it('should return 429 when rate limit is exceeded', async () => {
        vi.spyOn(rateLimiterMod, 'rateLimit').mockReturnValueOnce(false)

        // @ts-expect-error -- partial request mock
        await handler({ query: { url: 'https://example.com/feed.xml' } }, res)

        expect(res.status).toHaveBeenCalledWith(429)
    })
})
