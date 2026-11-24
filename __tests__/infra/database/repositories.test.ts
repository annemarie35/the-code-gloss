// kata-m3-rule
import { describe, it, expect, vi, afterEach } from 'vitest'
import pkg from 'pg'
import { insertGlose, selectAllGloses } from '@/infra/database/repositories'
import { query } from '@/infra/database/connectionPool'
import { INSERT_GLOSE, SELECT_ALL } from '@/infra/database/sql_queries'
import { GloseComplete } from '@/src/core/domain/models/Glose'

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

describe('repositories', () => {
    afterEach(() => {
        vi.resetAllMocks()
    })

    describe('insertGlose', () => {
        const glose: Omit<GloseComplete, 'id'> = {
            title: 'Event sourcing',
            description: 'The fundamental idea of Event Sourcing is that...',
            tags: 'DDD, code',
            created_at: '2024-01-01T00:00:00.000Z',
            themes: ['DDD']
        }

        it('should call query with INSERT_GLOSE and the glose fields including themes', async () => {
            queryMock.mockResolvedValue(mockQueryResult)

            await insertGlose(glose)

            expect(queryMock).toHaveBeenCalledOnce()
            expect(queryMock).toHaveBeenCalledWith(INSERT_GLOSE('public'), [
                glose.description,
                glose.title,
                glose.tags,
                glose.created_at,
                glose.themes
            ])
        })

        it('should insert an empty themes array when themes are missing', async () => {
            queryMock.mockResolvedValue(mockQueryResult)
            const { themes: _themes, ...gloseWithoutThemes } = glose

            // @ts-expect-error themes may be missing in a request body
            await insertGlose(gloseWithoutThemes)

            expect(queryMock).toHaveBeenCalledWith(INSERT_GLOSE('public'), [
                glose.description,
                glose.title,
                glose.tags,
                glose.created_at,
                []
            ])
        })

        it('should propagate errors thrown by query', async () => {
            queryMock.mockRejectedValue(new Error('db connection failed'))

            await expect(insertGlose(glose)).rejects.toThrow('db connection failed')
        })
    })

    describe('selectAllGloses', () => {
        it('should call query with SELECT_ALL', async () => {
            queryMock.mockResolvedValue({ ...mockQueryResult, rows: [], command: 'SELECT' })

            await selectAllGloses()

            expect(queryMock).toHaveBeenCalledOnce()
            expect(queryMock).toHaveBeenCalledWith(SELECT_ALL('public'), [])
        })

        it('should return rows from query result', async () => {
            const mockRows = [{ id: 1, title: 'Event sourcing', themes: ['DDD'] }]
            queryMock.mockResolvedValue({ ...mockQueryResult, rows: mockRows, command: 'SELECT' })

            const result = await selectAllGloses()

            expect(result).toEqual(mockRows)
        })
    })
})
