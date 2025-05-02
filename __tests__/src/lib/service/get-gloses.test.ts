import { describe, expect, it, vi } from 'vitest'
import pkg from 'pg'
const { Pool } = pkg

import * as mod from '@/infra/database/repositories'
import { getGlosesInMemory } from '@/src/lib/service/get-gloses'

describe('Get gloses', () => {
    it('Should get all gloses', async () => {
        vi.mock('pg', () => {
            const mockQuery = vi.fn().mockReturnValue({
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
            const MockPool = vi.fn(() => ({
                query: mockQuery
            }))

            const pkg = { Pool: MockPool }

            return {
                default: pkg,
                Pool: MockPool
            }
        })
        const getGlosesDbQuerySpy = vi.spyOn(mod, 'selectAllGloses')
        const gloses = await getGlosesInMemory()

        expect(Pool).toBeCalledTimes(1)

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
