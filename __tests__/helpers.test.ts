import { describe, expect, it } from 'vitest'
import { Glose } from '@/src/lib/get-gloses'
import { createFetchResponse } from '@/__tests__/helpers'

describe('Test helpers', () => {
    describe('createFetchResponse', () => {
        it('should mock a fetch response with data', async () => {
            const gloses: Glose[] = [
                {
                    created_at: 'date',
                    description: 'Invented by Alistair Cockburn in 2005',
                    id: 8,
                    tags: 'Craft, Architecture',
                    title: 'Hexagonale architecture'
                }
            ]

            const response = createFetchResponse({ data: gloses, ok: true })
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            // TODO Fixme
            expect(await response.json()).toEqual({ gloses })
            expect(response.ok).toEqual(true)
            expect(response.status).toEqual(200)
        })

        it('should mock a fetch response in error', async () => {
            const response = createFetchResponse({ ok: false })
            expect(response).toEqual({ json: undefined, ok: false, status: 500 })
        })
    })
})
