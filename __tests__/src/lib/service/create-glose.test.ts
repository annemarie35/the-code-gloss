import { describe, expect, it, vi } from 'vitest'

import * as mod from '@/src/lib/database/insert-gloses-db-query'
import { createGlose } from '@/src/lib/service/create-glose'

describe('createGlose', () => {
    it('Should persist glose', async () => {
        vi.useFakeTimers()
        const date = new Date(
            Date.parse(new Date(2006, 0, 2, 15, 4, 5).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }))
        )

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

        const insertDatabaseSpy = vi.spyOn(mod, 'insertGloseDbQuery')
        await createGlose({
            title: 'Title',
            description: 'Description',
            tags: ['Tag']
        })

        expect(insertDatabaseSpy).toHaveBeenLastCalledWith({
            title: 'Title',
            description: 'Description',
            tags: ['Tag'],
            created_at: date.toISOString()
        })
    })
})
