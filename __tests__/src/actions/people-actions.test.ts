import { describe, expect, it, vi } from 'vitest'
import { addPerson, getAllPeople } from '@/src/actions/people-actions'
import { InitialState } from '@/src/components/people-form'
import { createMockFetchResponse } from '@/__tests__/test-helpers.ts'
import { Person } from '@/src/core/domain/Types/Person'

const people: Person[] = [
    {
        id: 1,
        first_name: 'Ada',
        last_name: 'Lovelace',
        nickname: 'ada_codes',
        blog_url: 'https://ada.dev',
        linkedin_url: 'https://linkedin.com/in/ada',
        biography: 'First programmer',
        year_of_birth: 1815,
        tags: 'pioneer, math',
        created_at: '2000-02-01T12:00:00.000Z'
    }
]

describe('People actions', () => {
    describe('addPerson', async () => {
        const formData = {
            get: (key: string) => {
                const data: Record<string, string> = {
                    'first-name': 'Ada',
                    'last-name': 'Lovelace',
                    nickname: 'ada_codes',
                    'blog-url': 'https://ada.dev',
                    'linkedin-url': 'https://linkedin.com/in/ada',
                    biography: 'First programmer',
                    'year-of-birth': '1815',
                    tags: 'pioneer, math'
                }
                return data[key] ?? null
            },
            append: vi.fn(),
            delete: vi.fn(),
            getAll: vi.fn(),
            has: vi.fn(),
            set: vi.fn(),
            forEach: vi.fn(),
            entries: vi.fn(),
            keys: vi.fn(),
            values: vi.fn()
        }
        const initialState: InitialState = {
            message: '',
            error: ''
        }

        it('should add a person', async () => {
            const fetchResponse = createMockFetchResponse({ ok: true, status: 200 })
            global.fetch = vi.fn().mockResolvedValue(createMockFetchResponse(fetchResponse))

            // Type https://medium.com/@turingvang/typescript-2-8-3-type-must-have-a-symbol-iterator-method-that-returns-an-iterator-c240961216d4
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const response = await addPerson(initialState, formData)
            expect(response).toEqual({
                error: null,
                message: 'Ada ajouté(e) avec succès'
            })
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/people',
                expect.objectContaining({
                    method: 'POST',
                    mode: 'cors',
                    body: '{"first_name":"Ada","last_name":"Lovelace","nickname":"ada_codes","blog_url":"https://ada.dev","linkedin_url":"https://linkedin.com/in/ada","biography":"First programmer","year_of_birth":"1815","tags":"pioneer, math"}'
                })
            )
        })

        describe('with error on inserting', async () => {
            it('should return an error message', async () => {
                const fetchResponse = createMockFetchResponse({ ok: true, status: 200 })
                global.fetch = vi.fn().mockRejectedValue(createMockFetchResponse(fetchResponse))

                // Type https://medium.com/@turingvang/typescript-2-8-3-type-must-have-a-symbol-iterator-method-that-returns-an-iterator-c240961216d4
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                const response = await addPerson(initialState, formData)
                expect(response).toEqual({
                    error: "Une erreur est survenue dans l'ajout d'une personne",
                    message: null
                })
            })
        })
    })

    describe('getAllPeople', async () => {
        it('should get all people', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ people })
            })

            const response = await getAllPeople()
            expect(response).toEqual({
                error: null,
                message: null,
                people
            })
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/people',
                expect.objectContaining({
                    method: 'GET',
                    headers: new Headers(),
                    mode: 'cors'
                })
            )
        })

        describe('with error on fetching', async () => {
            it('should return an error message', async () => {
                global.fetch = vi.fn().mockRejectedValue(new Error('network error'))

                const response = await getAllPeople()
                expect(response).toEqual({
                    error: 'Une erreur est survenue en récupérant la liste des personnes',
                    message: null,
                    people: []
                })
            })
        })
    })
})
