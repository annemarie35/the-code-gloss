import handler from '@/src/pages/api/people'
import { describe, expect, it, vi } from 'vitest'
import * as addPersonMod from '@/src/core/domain/usecases/add-person.ts'
import * as rateLimiterMod from '@/src/lib/rate-limiter'

vi.mock('@/src/lib/rate-limiter', () => ({
    rateLimit: vi.fn().mockReturnValue(true),
    getIp: vi.fn().mockReturnValue('127.0.0.1')
}))

vi.mock('@/src/lib/service/add-person')

describe('People API', () => {
    it('should create a person when request method is POST with valid origin', async () => {
        const addPersonSpy = vi.spyOn(addPersonMod, 'addPerson')

        const request = {
            method: 'POST',
            headers: { origin: 'http://localhost:3000', host: 'localhost:3000' },
            body: '{"first_name":"Ada","last_name":"Lovelace","nickname":"ada_codes","blog_url":"https://ada.dev","linkedin_url":"https://linkedin.com/in/ada","biography":"First programmer","year_of_birth":"1815","tags":"pioneer, math"}'
        }
        const res = {
            status: vi.fn().mockReturnValue({ json: vi.fn() })
        }

        // @ts-expect-error -- partial request mock
        await handler(request, res)

        expect(addPersonSpy).toHaveBeenCalledWith({
            first_name: 'Ada',
            last_name: 'Lovelace',
            nickname: 'ada_codes',
            blog_url: 'https://ada.dev',
            linkedin_url: 'https://linkedin.com/in/ada',
            biography: 'First programmer',
            year_of_birth: '1815',
            tags: 'pioneer, math'
        })
        expect(res.status).toHaveBeenCalledWith(201)
    })

    it('should return 403 when POST request has no origin header', async () => {
        const request = {
            method: 'POST',
            headers: { host: 'localhost:3000' },
            body: '{"first_name":"Ada"}'
        }
        const res = {
            status: vi.fn().mockReturnValue({ json: vi.fn() })
        }
        // @ts-expect-error -- partial request mock
        await handler(request, res)
        expect(res.status).toHaveBeenCalledWith(403)
    })

    it('should return 403 when POST request has mismatched origin', async () => {
        const request = {
            method: 'POST',
            headers: { origin: 'http://evil.com', host: 'localhost:3000' },
            body: '{"first_name":"Ada"}'
        }
        const res = {
            status: vi.fn().mockReturnValue({ json: vi.fn() })
        }
        // @ts-expect-error -- partial request mock
        await handler(request, res)
        expect(res.status).toHaveBeenCalledWith(403)
    })

    it('should return 429 when POST rate limit is exceeded', async () => {
        vi.spyOn(rateLimiterMod, 'rateLimit').mockReturnValueOnce(false)
        const request = {
            method: 'POST',
            headers: { origin: 'http://localhost:3000', host: 'localhost:3000' },
            body: '{"first_name":"Ada"}'
        }
        const res = {
            status: vi.fn().mockReturnValue({ json: vi.fn() })
        }
        // @ts-expect-error -- partial request mock
        await handler(request, res)
        expect(res.status).toHaveBeenCalledWith(429)
    })

    it('should return 405 for non-POST methods', async () => {
        const request = { method: 'GET' }
        const res = {
            status: vi.fn().mockReturnValue({ json: vi.fn() })
        }
        // @ts-expect-error -- partial request mock
        await handler(request, res)
        expect(res.status).toHaveBeenCalledWith(405)
    })
})
