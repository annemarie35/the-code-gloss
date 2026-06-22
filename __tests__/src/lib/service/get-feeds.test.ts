import { describe, expect, it, vi, beforeEach } from 'vitest'
import { getFeedFromUrl } from '@/src/lib/service/get-feeds'

const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>Test Feed</title>
        <item>
            <title><![CDATA[Article 1]]></title>
            <description><![CDATA[Description 1]]></description>
            <link>https://example.com/1</link>
            <pubDate>Mon, 01 Jan 2025 00:00:00 UTC</pubDate>
        </item>
        <item>
            <title>Article 2</title>
            <description>Description 2</description>
            <link>https://example.com/2</link>
            <pubDate>Tue, 02 Jan 2025 00:00:00 UTC</pubDate>
        </item>
    </channel>
</rss>`

describe('getFeedFromUrl', () => {
    beforeEach(() => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(mockXml)
        })
    })

    it('should fetch and parse the feed title', async () => {
        const feed = await getFeedFromUrl('https://example.com/feed.xml')
        expect(feed.title).toBe('Test Feed')
    })

    it('should parse all items', async () => {
        const feed = await getFeedFromUrl('https://example.com/feed.xml')
        expect(feed.items).toHaveLength(2)
    })

    it('should parse item fields including CDATA', async () => {
        const feed = await getFeedFromUrl('https://example.com/feed.xml')
        expect(feed.items[0]).toEqual({
            title: 'Article 1',
            description: 'Description 1',
            link: 'https://example.com/1',
            pubDate: 'Mon, 01 Jan 2025 00:00:00 UTC'
        })
    })

    it('should throw when fetch fails', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false })
        await expect(getFeedFromUrl('https://example.com/feed.xml')).rejects.toThrow()
    })
})
