import handler from '@/src/pages/api/rss'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import * as getGlosesMod from '@/src/lib/service/get-gloses'
import { gloses } from '@/__tests__/test-helpers'

vi.mock('@/src/lib/service/get-gloses')

describe('RSS API', () => {
    let res: { setHeader: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn> }

    beforeEach(() => {
        const send = vi.fn()
        res = {
            setHeader: vi.fn(),
            status: vi.fn().mockReturnValue({ send }),
            send
        }
    })

    it('should return a 200 response with rss+xml content type', async () => {
        vi.spyOn(getGlosesMod, 'getGlosesInMemory').mockResolvedValue(gloses)

        // @ts-expect-error -- partial request mock, type not needed for this test
        await handler({}, res)

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/rss+xml; charset=utf-8')
        expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return a valid rss feed with channel metadata', async () => {
        vi.spyOn(getGlosesMod, 'getGlosesInMemory').mockResolvedValue(gloses)

        // @ts-expect-error -- partial request mock, type not needed for this test
        await handler({}, res)

        const xml: string = res.status.mock.results[0].value.send.mock.calls[0][0]
        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
        expect(xml).toContain('<rss version="2.0">')
        expect(xml).toContain('<title>Code Gloss</title>')
        expect(xml).toContain('<link>http://localhost:3000</link>')
        expect(xml).toContain('<description>Glossaire de termes du développement logiciel</description>')
    })

    it('should include glose items in the feed', async () => {
        vi.spyOn(getGlosesMod, 'getGlosesInMemory').mockResolvedValue(gloses)

        // @ts-expect-error -- partial request mock, type not needed for this test
        await handler({}, res)

        const xml: string = res.status.mock.results[0].value.send.mock.calls[0][0]
        expect(xml).toContain('<![CDATA[Hexagonale architecture]]>')
        expect(xml).toContain('<![CDATA[Invented by Alistair Cockburn in 2005]]>')
        expect(xml).toContain('<![CDATA[Craft, Architecture]]>')
    })

    it('should return an empty feed when there are no gloses', async () => {
        vi.spyOn(getGlosesMod, 'getGlosesInMemory').mockResolvedValue([])

        // @ts-expect-error -- partial request mock, type not needed for this test
        await handler({}, res)

        const xml: string = res.status.mock.results[0].value.send.mock.calls[0][0]
        expect(xml).toContain('<channel>')
        expect(xml).not.toContain('<item>')
    })
})
