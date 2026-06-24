import handler from '@/src/pages/api/people'
import { describe, expect, it, vi } from 'vitest'
import * as addPersonMod from '@/src/core/domain/usecases/add-person.ts'
import * as deletePersonMod from '@/src/core/domain/usecases/delete-person.ts'
import * as getPeopleMod from '@/src/lib/service/get-people'
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

    it('should get people when request method is GET', async () => {
        const getPeopleInMemorySpy = vi.spyOn(getPeopleMod, 'getPeopleInMemory').mockResolvedValue([])

        const request = { method: 'GET' }
        const res = {
            status: vi.fn().mockReturnValue({ json: vi.fn() })
        }
        // @ts-expect-error -- partial request mock
        await handler(request, res)
        expect(getPeopleInMemorySpy).toHaveBeenCalledOnce()
        expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return 429 when GET rate limit is exceeded', async () => {
        vi.spyOn(rateLimiterMod, 'rateLimit').mockReturnValueOnce(false)
        const request = { method: 'GET' }
        const res = {
            status: vi.fn().mockReturnValue({ json: vi.fn() })
        }
        // @ts-expect-error -- partial request mock
        await handler(request, res)
        expect(res.status).toHaveBeenCalledWith(429)
    })

    it('should delete a person when request method is DELETE with valid origin and id', async () => {
        const deletePersonSpy = vi.spyOn(deletePersonMod, 'deletePerson').mockResolvedValue('succes')

        const request = {
            method: 'DELETE',
            headers: { origin: 'http://localhost:3000', host: 'localhost:3000' },
            query: { id: '1' }
        }
        const res = {
            status: vi.fn().mockReturnValue({ json: vi.fn() })
        }
        // @ts-expect-error -- partial request mock
        await handler(request, res)
        expect(deletePersonSpy).toHaveBeenCalledWith(1)
        expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return 400 when DELETE request has no valid id', async () => {
        const request = {
            method: 'DELETE',
            headers: { origin: 'http://localhost:3000', host: 'localhost:3000' },
            query: { id: 'abc' }
        }
        const res = {
            status: vi.fn().mockReturnValue({ json: vi.fn() })
        }
        // @ts-expect-error -- partial request mock
        await handler(request, res)
        expect(res.status).toHaveBeenCalledWith(400)
    })

    it('should return 403 when DELETE request has no valid origin', async () => {
        const request = {
            method: 'DELETE',
            headers: { host: 'localhost:3000' },
            query: { id: '1' }
        }
        const res = {
            status: vi.fn().mockReturnValue({ json: vi.fn() })
        }
        // @ts-expect-error -- partial request mock
        await handler(request, res)
        expect(res.status).toHaveBeenCalledWith(403)
    })

    it('should return 429 when DELETE rate limit is exceeded', async () => {
        vi.spyOn(rateLimiterMod, 'rateLimit').mockReturnValueOnce(false)
        const request = {
            method: 'DELETE',
            headers: { origin: 'http://localhost:3000', host: 'localhost:3000' },
            query: { id: '1' }
        }
        const res = {
            status: vi.fn().mockReturnValue({ json: vi.fn() })
        }
        // @ts-expect-error -- partial request mock
        await handler(request, res)
        expect(res.status).toHaveBeenCalledWith(429)
    })

    it('should return 405 for unsupported methods', async () => {
        const request = { method: 'PUT' }
        const res = {
            status: vi.fn().mockReturnValue({ json: vi.fn() })
        }
        // @ts-expect-error -- partial request mock
        await handler(request, res)
        expect(res.status).toHaveBeenCalledWith(405)
    })
})
