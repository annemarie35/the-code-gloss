import { describe, expect, it, vi } from 'vitest'

import * as mod from '@/src/lib/service//add-glose'
import { AddGlose } from '@/src/lib/service/add-glose'

vi.mock('pg', () => {
    const mockQuery = vi.fn().mockReturnValue({
        rowsCount: 1
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

describe('createGlose', () => {
    it('Should persist glose', async () => {
        vi.useFakeTimers()
        const date = new Date(
            Date.parse(new Date(2006, 0, 2, 15, 4, 5).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }))
        )

        vi.setSystemTime(date)

        const insertDatabaseSpy = vi.spyOn(mod, 'AddGlose')
        await AddGlose({
            title: 'Title',
            description: 'Description',
            tags: 'Tag',
            created_at: ''
        })

        expect(insertDatabaseSpy).toHaveBeenLastCalledWith({
            title: 'Title',
            description: 'Description',
            tags: 'Tag',
            created_at: date.toISOString()
        })
    })
})
