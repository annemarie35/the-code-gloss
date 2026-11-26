import handler from '@/src/pages/api/people'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as addPersonMod from '@/src/core/domain/usecases/add-person.ts'
import * as deletePersonMod from '@/src/core/domain/usecases/delete-person.ts'
import * as getPeopleMod from '@/src/lib/service/get-people'
import { createMockApiResponse } from '@/__tests__/test-helpers.ts'
import { isSameOrigin } from '@/src/infrastructure/http/origin-check'
import { rateLimit } from '@/src/lib/rate-limiter'

vi.mock('@/src/lib/rate-limiter', () => ({
    rateLimit: vi.fn().mockReturnValue(true),
    getIp: vi.fn().mockReturnValue('127.0.0.1')
}))
vi.mock('@/src/infrastructure/http/origin-check', () => ({
    isSameOrigin: vi.fn().mockReturnValue(true)
}))

const validOriginHeaders = { origin: 'http://localhost:3000', host: 'localhost:3000' }
const body = '{"first_name":"Ada"}'

describe('People API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

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

        it('should rate limit GET requests by ip to 60 per minute', async () => {
            vi.mocked(rateLimit).mockReturnValueOnce(false)
            const { res, json } = createMockApiResponse()

            // @ts-expect-error -- partial request mock
            await handler({ method: 'GET', headers: validOriginHeaders, body, query: { id: '1' } }, res)

            expect(rateLimit).toHaveBeenCalledWith('127.0.0.1', 60, 60_000)
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
    })

    it.each(['POST', 'DELETE'])('should refuse %s requests from another origin', async (method) => {
        vi.mocked(isSameOrigin).mockReturnValueOnce(false)
        const addPersonSpy = vi.spyOn(addPersonMod, 'addPerson').mockResolvedValue('succes')
        const deletePersonSpy = vi.spyOn(deletePersonMod, 'deletePerson').mockResolvedValue('succes')
        const { res, json } = createMockApiResponse()

        // @ts-expect-error -- partial request mock
        await handler({ method, headers: validOriginHeaders, body, query: { id: '1' } }, res)

        expect(isSameOrigin).toHaveBeenCalledWith(validOriginHeaders)
        expect(addPersonSpy).not.toHaveBeenCalled()
        expect(deletePersonSpy).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(403)
        expect(json).toHaveBeenCalledWith({ error: 'Forbidden' })
    })

    it('should return 405 with the allowed methods for unsupported methods', async () => {
        const { res, json } = createMockApiResponse()
        const setHeader = vi.fn()

        // @ts-expect-error -- partial request mock
        await handler({ method: 'PUT' }, { ...res, setHeader })

        expect(setHeader).toHaveBeenCalledWith('Allow', 'GET, POST, DELETE')
        expect(res.status).toHaveBeenCalledWith(405)
        expect(json).toHaveBeenCalledWith({ error: 'Method Not Allowed' })
    })
})
