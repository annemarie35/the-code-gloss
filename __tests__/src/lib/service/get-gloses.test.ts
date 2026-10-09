import { describe, expect, it, vi } from 'vitest'
import { SELECT_ALL } from '@/infra/database/sql_queries'
import * as mod from '@/infra/database/repositories'
import { getGlosesInMemory } from '@/src/lib/service/get-gloses'

const { mockQuery } = vi.hoisted(() => ({
    mockQuery: vi.fn()
}))

vi.mock('pg', () => {
    mockQuery.mockReturnValue({
        rows: [
            {
                id: 1,
                title: 'TDD',
                description: 'Created by Kent Beck',
                tags: 'XP',
                created_at: '2000-02-01T12:00:00.000Z'
            }
        ]
    })
    const MockPool = vi.fn(function () {
        return { query: mockQuery }
    })

    const pkg = { Pool: MockPool }

    return {
        default: pkg,
        Pool: MockPool
    }
})

describe('Get gloses', () => {
    it('Should get all gloses', async () => {
        const getGlosesDbQuerySpy = vi.spyOn(mod, 'selectAllGloses')
        const gloses = await getGlosesInMemory()

        expect(mockQuery).toHaveBeenCalledExactlyOnceWith(SELECT_ALL('public'), [])

        expect(getGlosesDbQuerySpy).toHaveBeenCalledOnce()
        expect(gloses).toEqual([
            {
                id: 1,
                title: 'TDD',
                description: 'Created by Kent Beck',
                tags: 'XP',
                created_at: '2000-02-01T12:00:00.000Z'
            }
        ])
    })
})
