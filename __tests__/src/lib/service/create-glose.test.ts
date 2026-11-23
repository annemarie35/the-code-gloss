import { afterEach, describe, expect, it, vi } from 'vitest'
import { AddGlose } from '@/src/lib/service/add-glose'
import { insertGlose } from '@/infra/database/repositories'

vi.mock('@/infra/database/repositories', () => ({
    insertGlose: vi.fn()
}))

describe('createGlose', () => {
    afterEach(() => {
        vi.useRealTimers()
        vi.resetAllMocks()
    })

    it('Should persist glose with its themes and creation date', async () => {
        vi.useFakeTimers()
        const date = new Date(2006, 0, 2, 15, 4, 5)
        vi.setSystemTime(date)

        const response = await AddGlose({
            title: 'Title',
            description: 'Description',
            tags: 'Tag',
            created_at: '',
            themes: ['CRAFT']
        })

        expect(response).toBe('succes')
        expect(insertGlose).toHaveBeenCalledWith({
            title: 'Title',
            description: 'Description',
            tags: 'Tag',
            themes: ['CRAFT'],
            created_at: date.toISOString()
        })
    })
})
