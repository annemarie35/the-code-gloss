import { describe, expect, it, vi } from 'vitest'

import * as mod from '@/src/lib/database/insert-gloses-db'
import { createGlose } from '@/src/lib/database/create-glose'

describe('createGlose', () => {
    it('Should persist glose', async () => {
        vi.useFakeTimers()
        const date = new Date(2000, 1, 1, 13)
        vi.setSystemTime(date)
        vi.mock('knex', () => ({
            default: vi.fn().mockReturnValue(() => {
                return {
                    insert: () => {
                        return { returning: () => [{ title: 'TDD' }] }
                    }
                }
            })
        }))

        const insertDatabaseSpy = vi.spyOn(mod, 'insert')
        await createGlose({
            title: 'Title',
            description: 'Description',
            tags: ['Tag'],
            created_at: '2000-02-01T12:00:00.000Z'
        })

        expect(insertDatabaseSpy).toHaveBeenLastCalledWith({
            title: 'Title',
            description: 'Description',
            tags: ['Tag'],
            created_at: '2000-02-01T12:00:00.000Z'
        })
    })
})
