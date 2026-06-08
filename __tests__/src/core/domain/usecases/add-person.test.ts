import { describe, expect, it, vi } from 'vitest'
import { addPerson } from '@/src/core/domain/usecases/add-person'

describe('addPerson', () => {
    const person = {
        first_name: 'Ada',
        last_name: 'Lovelace',
        nickname: 'ada_codes',
        blog_url: 'https://ada.dev',
        linkedin_url: 'https://linkedin.com/in/ada',
        biography: 'First programmer',
        year_of_birth: 1815,
        tags: 'pioneer, math'
    }

    it('should call insertPerson with person and generated created_at', async () => {
        vi.useFakeTimers()
        const date = new Date('2006-01-02T14:04:05.000Z')
        vi.setSystemTime(date)

        const insertPersonMock = vi.fn().mockResolvedValue(undefined)

        await addPerson(person, insertPersonMock)

        expect(insertPersonMock).toHaveBeenCalledOnce()
        expect(insertPersonMock).toHaveBeenCalledWith({
            ...person,
            created_at: date.toISOString()
        })

        vi.useRealTimers()
    })

    it('should return "succes"', async () => {
        const insertPersonMock = vi.fn().mockResolvedValue(undefined)

        const result = await addPerson(person, insertPersonMock)

        expect(result).toBe('succes')
    })

    it('should propagate errors from insertPerson', async () => {
        const insertPersonMock = vi.fn().mockRejectedValue(new Error('db error'))

        await expect(addPerson(person, insertPersonMock)).rejects.toThrow('db error')
    })
})
