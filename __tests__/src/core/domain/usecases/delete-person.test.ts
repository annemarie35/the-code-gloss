import { describe, expect, it, vi } from 'vitest'
import { deletePerson } from '@/src/core/domain/usecases/delete-person'

describe('deletePerson', () => {
    it('should call deletePersonFn with the given id', async () => {
        const deletePersonFnMock = vi.fn().mockResolvedValue(undefined)

        await deletePerson(1, deletePersonFnMock)

        expect(deletePersonFnMock).toHaveBeenCalledOnce()
        expect(deletePersonFnMock).toHaveBeenCalledWith(1)
    })

    it('should return "succes"', async () => {
        const deletePersonFnMock = vi.fn().mockResolvedValue(undefined)

        const result = await deletePerson(1, deletePersonFnMock)

        expect(result).toBe('succes')
    })

    it('should propagate errors from deletePersonFn', async () => {
        const deletePersonFnMock = vi.fn().mockRejectedValue(new Error('db error'))

        await expect(deletePerson(1, deletePersonFnMock)).rejects.toThrow('db error')
    })
})
