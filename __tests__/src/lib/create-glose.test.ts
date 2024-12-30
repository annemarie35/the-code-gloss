import { describe, expect, it, vi } from 'vitest'
import { createGlose } from '@/src/lib/create-glose'

import * as mod from '@/src/lib/insert-gloses-db'

describe('createGlose', () => {
    it('Should persist glose', async () => {
        vi.mock('knex', () => ({
            default: vi.fn().mockReturnValue(() => {
                return { insert: () => 'Inserted !' }
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
