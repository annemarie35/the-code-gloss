import handler from '@/src/pages/api/gloses'
import { describe, expect, it, vi } from 'vitest'
import * as getGlosesMod from '@/src/lib/service/get-gloses'
import * as createGloseMod from '@/src/lib/service/create-glose'

describe('Glose api', () => {
    it('should get gloses when request method is GET', async () => {
        const getGlosesSpy = vi.spyOn(getGlosesMod, 'getGlose')
        vi.mock('@/src/lib/database/get-gloses-db-query')

        const request = {
            method: 'GET'
        }
        const res = {
            status: vi.fn().mockReturnValue({
                json: vi.fn().mockReturnValue({
                    message: 'Voici vos gloses',
                    gloses: []
                })
            })
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // TODO Type for request
        await handler(request, res)
        expect(getGlosesSpy).toHaveBeenCalledOnce()
    })

    it('should create a glose when request method is POST', async () => {
        vi.useFakeTimers()
        const date = new Date(2000, 1, 1, 13)
        vi.setSystemTime(date)

        vi.mock('@/src/lib/database/insert-gloses-db-query')
        const createGlosesSpy = vi.spyOn(createGloseMod, 'createGlose')

        const request = {
            method: 'POST',
            body: '{"title":"TDD","description":"Created by Kent Beck","tags":"XP"}'
        }
        const res = {
            status: vi.fn().mockReturnValue({
                json: vi.fn().mockReturnValue({
                    message: 'Voici vos gloses',
                    gloses: []
                })
            })
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // TODO Type for request
        await handler(request, res)
        expect(createGlosesSpy).toHaveBeenCalledWith({ title: 'TDD', description: 'Created by Kent Beck', tags: 'XP' })
    })
})
