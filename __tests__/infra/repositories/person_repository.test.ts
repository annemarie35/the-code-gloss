import { describe, it, expect, vi, afterEach } from 'vitest'
import pkg from 'pg'
import { insertPerson } from '@/infra/repositories/person_repository'
import { query } from '@/infra/database/connectionPool'
import { INSERT_PERSON } from '@/infra/database/sql_queries'

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
})
