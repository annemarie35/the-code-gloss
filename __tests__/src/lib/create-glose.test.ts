import { describe, expect, it, vi } from 'vitest'

import * as mod from '@/src/lib/database/insert-gloses-db'
import { createGlose } from '@/src/lib/database/create-glose'

describe('createGlose', () => {
    it('Should persist glose', async () => {
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
            tags: ['Tag']
        })

        expect(insertDatabaseSpy).toHaveBeenLastCalledWith({
            title: 'Title',
            description: 'Description',
            tags: ['Tag']
        })
    })
})
