import { describe, expect, it } from 'vitest'
import { createMockFetchResponse, gloses } from '@/__tests__/test-helpers.ts'

describe('Test helpers', () => {
    describe('createFetchResponse', () => {
        it('should mock a fetch response with data', async () => {
            const response = createMockFetchResponse({ data: gloses, ok: true })
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            // TODO Fixme
            expect(await response.json()).toEqual({ gloses })
            expect(response.ok).toEqual(true)
            expect(response.status).toEqual(200)
        })

        it('should mock a fetch response in error', async () => {
            const response = createMockFetchResponse({ ok: false })
            expect(response).toEqual({ json: undefined, ok: false, status: 500 })
        })
    })
})
