import handler from '@/src/pages/api/gloses'
import { describe, expect, it, vi } from 'vitest'
import * as addGloseMod from '@/src/lib/service/add-glose'
import * as getGlosesModTOI from '../../../src/lib/service/get-gloses'
import * as rateLimiterMod from '@/src/lib/rate-limiter'
import { createMockApiResponse, gloses } from '@/__tests__/test-helpers.ts'

vi.mock('@/src/lib/rate-limiter', () => ({
    rateLimit: vi.fn().mockReturnValue(true),
    getIp: vi.fn().mockReturnValue('127.0.0.1')
}))
vi.mock('@/src/lib/service/get-gloses')
vi.mock('@/src/lib/service/add-glose')
vi.mock('@/src/lib/database/insert-gloses-db-query')

const body = '{"title":"TDD","description":"Created by Kent Beck","tags":"XP"}'

describe('Gloses API', () => {
    it('should get gloses when request method is GET', async () => {
        const getGlosesInMemorySpy = vi.spyOn(getGlosesModTOI, 'getGlosesInMemory').mockResolvedValue(gloses)
        const { res, json } = createMockApiResponse()

        // @ts-expect-error -- partial request mock
        await handler({ method: 'GET' }, res)

        expect(getGlosesInMemorySpy).toHaveBeenCalledOnce()
        expect(res.status).toHaveBeenLastCalledWith(200)
        expect(json).toHaveBeenCalledWith({ message: 'Voici vos gloses', gloses })
    })

    it('should create a glose when request method is POST with valid origin', async () => {
        const createGlosesSpy = vi.spyOn(addGloseMod, 'AddGlose')
        const { res, json } = createMockApiResponse()
        const request = {
            method: 'POST',
            headers: { origin: 'http://localhost:3000', host: 'localhost:3000' },
            body
        }

        // @ts-expect-error -- partial request mock
        await handler(request, res)

        expect(createGlosesSpy).toHaveBeenCalledWith({
            title: 'TDD',
            description: 'Created by Kent Beck',
            tags: 'XP'
        })
        expect(res.status).toHaveBeenCalledWith(201)
        expect(json).toHaveBeenCalledWith({ message: 'Glose ajouté avec succès', gloses: [] })
    })

    it('should return 403 when POST request has no origin header', async () => {
        const { res, json } = createMockApiResponse()
        const request = { method: 'POST', headers: { host: 'localhost:3000' }, body }

        // @ts-expect-error -- partial request mock
        await handler(request, res)

        expect(res.status).toHaveBeenCalledWith(403)
        expect(json).toHaveBeenCalledWith({ error: 'Forbidden' })
    })

    it('should return 403 when POST request has an empty host header', async () => {
        const { res } = createMockApiResponse()
        const request = { method: 'POST', headers: { origin: 'file:///', host: '' }, body }

        // @ts-expect-error -- partial request mock
        await handler(request, res)

        expect(res.status).toHaveBeenCalledWith(403)
    })

    it('should return 403 when POST request has a malformed origin', async () => {
        const { res } = createMockApiResponse()
        const request = { method: 'POST', headers: { origin: 'not-a-url', host: 'localhost:3000' }, body }

        // @ts-expect-error -- partial request mock
        await handler(request, res)

        expect(res.status).toHaveBeenCalledWith(403)
    })

    it('should return 403 when POST request has mismatched origin', async () => {
        const { res } = createMockApiResponse()
        const request = { method: 'POST', headers: { origin: 'http://evil.com', host: 'localhost:3000' }, body }

        // @ts-expect-error -- partial request mock
        await handler(request, res)

        expect(res.status).toHaveBeenCalledWith(403)
    })

    it('should return 429 when POST rate limit is exceeded', async () => {
        vi.spyOn(rateLimiterMod, 'rateLimit').mockReturnValueOnce(false)
        const { res, json } = createMockApiResponse()
        const request = {
            method: 'POST',
            headers: { origin: 'http://localhost:3000', host: 'localhost:3000' },
            body
        }

        // @ts-expect-error -- partial request mock
        await handler(request, res)

        expect(res.status).toHaveBeenCalledWith(429)
        expect(json).toHaveBeenCalledWith({ error: 'Too Many Requests' })
    })

    it('should return 429 when GET rate limit is exceeded', async () => {
        vi.spyOn(rateLimiterMod, 'rateLimit').mockReturnValueOnce(false)
        const { res, json } = createMockApiResponse()

        // @ts-expect-error -- partial request mock
        await handler({ method: 'GET' }, res)

        expect(res.status).toHaveBeenCalledWith(429)
        expect(json).toHaveBeenCalledWith({ error: 'Too Many Requests' })
    })
})
