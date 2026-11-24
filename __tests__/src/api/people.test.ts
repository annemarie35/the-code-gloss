import handler from '@/src/pages/api/people'
import { describe, expect, it, vi } from 'vitest'
import * as addPersonMod from '@/src/core/domain/usecases/add-person.ts'
import * as deletePersonMod from '@/src/core/domain/usecases/delete-person.ts'
import * as getPeopleMod from '@/src/lib/service/get-people'
import * as rateLimiterMod from '@/src/lib/rate-limiter'
import { createMockApiResponse } from '@/__tests__/test-helpers.ts'

vi.mock('@/src/lib/rate-limiter', () => ({
    rateLimit: vi.fn().mockReturnValue(true),
    getIp: vi.fn().mockReturnValue('127.0.0.1')
}))

const validOriginHeaders = { origin: 'http://localhost:3000', host: 'localhost:3000' }

describe('People API', () => {
    describe('Create a person', () => {
        it('should create a person when request method is POST with valid origin', async () => {
            const addPersonSpy = vi.spyOn(addPersonMod, 'addPerson').mockResolvedValue('succes')
            const { res, json } = createMockApiResponse()
            const request = {
                method: 'POST',
                headers: validOriginHeaders,
                body: '{"first_name":"Ada","last_name":"Lovelace","nickname":"ada_codes","blog_url":"https://ada.dev","linkedin_url":"https://linkedin.com/in/ada","biography":"First programmer","year_of_birth":"1815","tags":"pioneer, math"}'
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
            expect(json).toHaveBeenCalledWith({ message: 'Personne ajoutée avec succès' })
        })

        it('should return 403 when POST request has no origin header', async () => {
            const { res, json } = createMockApiResponse()
            const request = { method: 'POST', headers: { host: 'localhost:3000' }, body: '{"first_name":"Ada"}' }

            // @ts-expect-error -- partial request mock
            await handler(request, res)

            expect(res.status).toHaveBeenCalledWith(403)
            expect(json).toHaveBeenCalledWith({ error: 'Forbidden' })
        })

        it('should return 403 when POST request has an empty host header', async () => {
            const { res } = createMockApiResponse()
            const request = { method: 'POST', headers: { origin: 'file:///', host: '' }, body: '{"first_name":"Ada"}' }

            // @ts-expect-error -- partial request mock
            await handler(request, res)

            expect(res.status).toHaveBeenCalledWith(403)
        })

        it('should return 403 when POST request has a malformed origin', async () => {
            const { res } = createMockApiResponse()
            const request = {
                method: 'POST',
                headers: { origin: 'not-a-url', host: 'localhost:3000' },
                body: '{"first_name":"Ada"}'
            }

            // @ts-expect-error -- partial request mock
            await handler(request, res)

            expect(res.status).toHaveBeenCalledWith(403)
        })

        it('should return 403 when POST request has mismatched origin', async () => {
            const { res } = createMockApiResponse()
            const request = {
                method: 'POST',
                headers: { origin: 'http://evil.com', host: 'localhost:3000' },
                body: '{"first_name":"Ada"}'
            }

            // @ts-expect-error -- partial request mock
            await handler(request, res)

            expect(res.status).toHaveBeenCalledWith(403)
        })

        it('should return 429 when POST rate limit is exceeded', async () => {
            vi.spyOn(rateLimiterMod, 'rateLimit').mockReturnValueOnce(false)
            const { res, json } = createMockApiResponse()
            const request = { method: 'POST', headers: validOriginHeaders, body: '{"first_name":"Ada"}' }

            // @ts-expect-error -- partial request mock
            await handler(request, res)

            expect(res.status).toHaveBeenCalledWith(429)
            expect(json).toHaveBeenCalledWith({ error: 'Too Many Requests' })
        })
    })

    describe('Retrieve all persons', () => {
        it('should get people when request method is GET', async () => {
            const people = [{ id: 1, first_name: 'Ada', last_name: 'Lovelace' }]
            // @ts-expect-error -- partial person mock
            const getPeopleInMemorySpy = vi.spyOn(getPeopleMod, 'getPeopleInMemory').mockResolvedValue(people)
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request mock
            await handler({ method: 'GET' }, res)

            expect(getPeopleInMemorySpy).toHaveBeenCalledOnce()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(json).toHaveBeenCalledWith({ message: 'Voici vos personnes', people })
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

    describe('Delete a person by id', () => {
        it('should delete a person when request method is DELETE with valid origin and id', async () => {
            const deletePersonSpy = vi.spyOn(deletePersonMod, 'deletePerson').mockResolvedValue('succes')
            const { res, json } = createMockApiResponse()
            const request = { method: 'DELETE', headers: validOriginHeaders, query: { id: '1' } }

            // @ts-expect-error -- partial request mock
            await handler(request, res)

            expect(deletePersonSpy).toHaveBeenCalledWith(1)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(json).toHaveBeenCalledWith({ message: 'Personne supprimée avec succès' })
        })

        it('should return 400 when DELETE request has no valid id', async () => {
            const { res, json } = createMockApiResponse()
            const request = { method: 'DELETE', headers: validOriginHeaders, query: { id: 'abc' } }

            // @ts-expect-error -- partial request mock
            await handler(request, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(json).toHaveBeenCalledWith({ error: 'Invalid id' })
        })

        it('should return 403 when DELETE request has no valid origin', async () => {
            const { res, json } = createMockApiResponse()
            const request = { method: 'DELETE', headers: { host: 'localhost:3000' }, query: { id: '1' } }

            // @ts-expect-error -- partial request mock
            await handler(request, res)

            expect(res.status).toHaveBeenCalledWith(403)
            expect(json).toHaveBeenCalledWith({ error: 'Forbidden' })
        })

        it('should return 429 when DELETE rate limit is exceeded', async () => {
            vi.spyOn(rateLimiterMod, 'rateLimit').mockReturnValueOnce(false)
            const { res, json } = createMockApiResponse()
            const request = { method: 'DELETE', headers: validOriginHeaders, query: { id: '1' } }

            // @ts-expect-error -- partial request mock
            await handler(request, res)

            expect(res.status).toHaveBeenCalledWith(429)
            expect(json).toHaveBeenCalledWith({ error: 'Too Many Requests' })
        })
    })

    it('should return 405 for unsupported methods', async () => {
        const { res, json } = createMockApiResponse()

        // @ts-expect-error -- partial request mock
        await handler({ method: 'PUT' }, res)

        expect(res.status).toHaveBeenCalledWith(405)
        expect(json).toHaveBeenCalledWith({ error: 'Method Not Allowed' })
    })
})
