import handler from '@/src/pages/api/gloses'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as addGloseMod from '@/src/lib/service/add-glose'
import * as getGlosesModTOI from '../../../src/lib/service/get-gloses'
import { rateLimit } from '@/src/lib/rate-limiter'
import { isSameOrigin } from '@/src/infrastructure/http/origin-check'
import { createMockApiResponse, gloses } from '@/__tests__/test-helpers.ts'

vi.mock('@/src/lib/rate-limiter', () => ({
    rateLimit: vi.fn().mockReturnValue(true),
    getIp: vi.fn().mockReturnValue('127.0.0.1')
}))
vi.mock('@/src/infrastructure/http/origin-check', () => ({
    isSameOrigin: vi.fn().mockReturnValue(true)
}))
vi.mock('@/src/lib/service/get-gloses')
vi.mock('@/src/lib/service/add-glose')
vi.mock('@/src/lib/database/insert-gloses-db-query')

const body = '{"title":"TDD","description":"Created by Kent Beck","tags":"XP"}'
const validOriginHeaders = { origin: 'http://localhost:3000', host: 'localhost:3000' }

describe('Gloses API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should get gloses when request method is GET', async () => {
        const getGlosesInMemorySpy = vi.spyOn(getGlosesModTOI, 'getGlosesInMemory').mockResolvedValue(gloses)
        const { res, json } = createMockApiResponse()
        const setHeader = vi.fn()

        // @ts-expect-error -- partial request mock
        await handler({ method: 'GET', headers: validOriginHeaders }, { ...res, setHeader })

        expect(getGlosesInMemorySpy).toHaveBeenCalledOnce()
        expect(res.status).toHaveBeenLastCalledWith(200)
        expect(json).toHaveBeenCalledWith({ message: 'Voici vos gloses', gloses })
    })

    it('should create a glose when request method is POST with valid origin', async () => {
        const createGlosesSpy = vi.spyOn(addGloseMod, 'AddGlose')
        const { res, json } = createMockApiResponse()
        const setHeader = vi.fn()
        const request = {
            method: 'POST',
            headers: { origin: 'http://localhost:3000', host: 'localhost:3000' },
            body
        }

        // @ts-expect-error -- partial request mock
        await handler(request, { ...res, setHeader })

        expect(createGlosesSpy).toHaveBeenCalledWith({
            title: 'TDD',
            description: 'Created by Kent Beck',
            tags: 'XP'
        })
        expect(res.status).toHaveBeenCalledWith(201)
        expect(json).toHaveBeenCalledWith({ message: 'Glose ajouté avec succès', gloses: [] })
    })

    it('should check the origin of POST requests', async () => {
        const { res } = createMockApiResponse()
        const setHeader = vi.fn()

        // @ts-expect-error -- partial request mock
        await handler({ method: 'POST', headers: validOriginHeaders, body }, { ...res, setHeader })

        expect(isSameOrigin).toHaveBeenCalledWith(validOriginHeaders)
    })

    it('should refuse POST requests from another origin', async () => {
        vi.mocked(isSameOrigin).mockReturnValueOnce(false)
        const createGlosesSpy = vi.spyOn(addGloseMod, 'AddGlose')
        const { res, json } = createMockApiResponse()
        const setHeader = vi.fn()

        // @ts-expect-error -- partial request mock
        await handler({ method: 'POST', headers: validOriginHeaders, body }, { ...res, setHeader })

        expect(createGlosesSpy).not.toHaveBeenCalled()
        expect(rateLimit).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(403)
        expect(json).toHaveBeenCalledWith({ error: 'Forbidden' })
    })

    it.each([
        ['GET', 60],
        ['POST', 10]
    ])('should rate limit %s requests by ip to %i per minute', async (method, limit) => {
        vi.mocked(rateLimit).mockReturnValueOnce(false)
        const { res } = createMockApiResponse()
        const setHeader = vi.fn()

        // @ts-expect-error -- partial request mock
        await handler({ method, headers: validOriginHeaders, body }, { ...res, setHeader })

        expect(rateLimit).toHaveBeenCalledWith('127.0.0.1', limit, 60_000)
        expect(res.status).toHaveBeenCalledWith(429)
    })

    it('should return 405 with the allowed methods for any other method', async () => {
        const { res, json } = createMockApiResponse()
        const setHeader = vi.fn()

        // @ts-expect-error -- partial request mock
        await handler({ method: 'PUT', query: {} }, { ...res, setHeader })

        expect(setHeader).toHaveBeenCalledWith('Allow', 'GET, POST')
        expect(res.status).toHaveBeenCalledWith(405)
        expect(json).toHaveBeenCalledWith({ error: 'Method Not Allowed' })
    })
})
