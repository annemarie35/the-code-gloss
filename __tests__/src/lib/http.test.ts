import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { loggerErrorMock, pinoMock } = vi.hoisted(() => {
    const loggerErrorMock = vi.fn()
    return {
        loggerErrorMock,
        pinoMock: vi.fn(() => ({ error: loggerErrorMock }))
    }
})

vi.mock('pino', () => ({ pino: pinoMock }))

import { httpClient } from '@/src/lib/http'

const CATCH_ERROR_MESSAGE = ' encore une erreur dans le catch de http client'

const requestConfig = {
    method: 'GET' as const,
    headers: new Headers({ 'Content-Type': 'application/json' }),
    mode: 'cors' as const
}

describe('httpClient', () => {
    beforeEach(() => {
        loggerErrorMock.mockClear()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('should call fetch with the given url and request config', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
        vi.stubGlobal('fetch', fetchMock)

        await httpClient({ url: '/api/gloses', requestConfig })

        expect(fetchMock).toHaveBeenCalledWith('/api/gloses', requestConfig)
    })

    it('should return the parsed JSON body when the response is ok', async () => {
        const body = { data: [{ id: 1, title: 'TDD' }] }
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => body }))

        const result = await httpClient({ url: '/api/gloses', requestConfig })

        expect(result).toEqual(body)
        expect(loggerErrorMock).not.toHaveBeenCalled()
    })

    it('should throw and log the failure when the response is not ok', async () => {
        const json = vi.fn()
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json }))

        await expect(httpClient({ url: '/api/gloses', requestConfig })).rejects.toThrow(CATCH_ERROR_MESSAGE)

        expect(json).not.toHaveBeenCalled()
        expect(loggerErrorMock).toHaveBeenCalledOnce()
        expect(loggerErrorMock).toHaveBeenCalledWith(new Error('Erreur dans récupérations des gloses'))
    })

    it('should throw and log the failure when the JSON body is invalid', async () => {
        const parseError = new SyntaxError('Unexpected token < in JSON')
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => {
                    throw parseError
                }
            })
        )

        await expect(httpClient({ url: '/api/gloses', requestConfig })).rejects.toThrow(CATCH_ERROR_MESSAGE)

        expect(loggerErrorMock).toHaveBeenCalledWith(parseError)
    })

    it('should throw and log the failure when the network request fails', async () => {
        const networkError = new TypeError('Failed to fetch')
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(networkError))

        await expect(httpClient({ url: '/api/gloses', requestConfig })).rejects.toThrow(CATCH_ERROR_MESSAGE)

        expect(loggerErrorMock).toHaveBeenCalledWith(networkError)
    })
})
