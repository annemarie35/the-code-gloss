import { describe, it, expect, vi, afterEach } from 'vitest'
import pkg from 'pg'
import { insertPerson, selectAllPeople, deletePerson } from '@/infra/repositories/person_repository'
import { query } from '@/infra/database/connectionPool'
import { INSERT_PERSON, SELECT_ALL_PEOPLE, DELETE_PERSON } from '@/infra/database/sql_queries'

const mockQueryResult: pkg.QueryResult<pkg.QueryResultRow> = {
    rows: [],
    fields: [],
    command: 'INSERT',
    rowCount: 1,
    oid: 0
}

vi.mock('@/infra/database/connectionPool', () => ({
    query: vi.fn()
}))

const queryMock = vi.mocked(query)

describe('person_repository', () => {
    afterEach(() => {
        vi.resetAllMocks()
    })

    describe('insertPerson', () => {
        const person = {
            first_name: 'Ada',
            last_name: 'Lovelace',
            nickname: 'ada_codes',
            blog_url: 'https://ada.dev',
            linkedin_url: 'https://linkedin.com/in/ada',
            biography: 'First programmer',
            year_of_birth: 1815,
            tags: 'pioneer, math',
            created_at: '2024-01-01T00:00:00.000Z'
        }

        it('should call query with INSERT_PERSON and the person fields', async () => {
            queryMock.mockResolvedValue(mockQueryResult)

            await insertPerson(person)

            expect(queryMock).toHaveBeenCalledOnce()
            expect(queryMock).toHaveBeenCalledWith(INSERT_PERSON('public'), [
                person.first_name,
                person.last_name,
                person.nickname,
                person.blog_url,
                person.linkedin_url,
                person.biography,
                person.year_of_birth,
                person.tags,
                person.created_at
            ])
        })

        it('should return undefined on success', async () => {
            queryMock.mockResolvedValue(mockQueryResult)

            const result = await insertPerson(person)

            expect(result).toBeUndefined()
        })

        it('should propagate errors thrown by query', async () => {
            queryMock.mockRejectedValue(new Error('db connection failed'))

            await expect(insertPerson(person)).rejects.toThrow('db connection failed')
        })
    })

    describe('selectAllPeople', () => {
        it('should call query with SELECT_ALL_PEOPLE', async () => {
            queryMock.mockResolvedValue({ ...mockQueryResult, rows: [], command: 'SELECT' })

            await selectAllPeople()

            expect(queryMock).toHaveBeenCalledOnce()
            expect(queryMock).toHaveBeenCalledWith(SELECT_ALL_PEOPLE('public'), [])
        })

        it('should return rows from query result', async () => {
            const mockRows = [{ id: 1, first_name: 'Ada', last_name: 'Lovelace' }]
            queryMock.mockResolvedValue({ ...mockQueryResult, rows: mockRows, command: 'SELECT' })

            const result = await selectAllPeople()

            expect(result).toEqual(mockRows)
        })

        it('should propagate errors thrown by query', async () => {
            queryMock.mockRejectedValue(new Error('db connection failed'))

            await expect(selectAllPeople()).rejects.toThrow('db connection failed')
        })
    })

    describe('deletePerson', () => {
        it('should call query with DELETE_PERSON and the id', async () => {
            queryMock.mockResolvedValue({ ...mockQueryResult, command: 'DELETE' })

            await deletePerson(1)

            expect(queryMock).toHaveBeenCalledOnce()
            expect(queryMock).toHaveBeenCalledWith(DELETE_PERSON('public'), [1])
        })

        it('should return undefined on success', async () => {
            queryMock.mockResolvedValue({ ...mockQueryResult, command: 'DELETE' })

            const result = await deletePerson(1)

            expect(result).toBeUndefined()
        })

        it('should propagate errors thrown by query', async () => {
            queryMock.mockRejectedValue(new Error('db connection failed'))

            await expect(deletePerson(1)).rejects.toThrow('db connection failed')
        })
    })
})
