import { describe, expect, it, vi, beforeEach } from 'vitest'
import { getFeedFromUrl } from '@/src/lib/service/get-feeds'

const mockRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>Test RSS Feed</title>
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

const mockAtomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Martin Fowler</title>
  <entry>
    <title>Ideological Resistance to Patents</title>
    <link href="https://martinfowler.com/articles/patents-reluctant-pragmatism.html"/>
    <updated>2026-03-05T14:54:00+01:00</updated>
    <summary>Article about software patents.</summary>
  </entry>
  <entry>
    <title>Another Article</title>
    <link href="https://martinfowler.com/articles/another.html"/>
    <updated>2026-01-10T10:00:00+01:00</updated>
    <summary>Another article summary.</summary>
  </entry>
</feed>`

describe('getFeedFromUrl', () => {
    describe('with RSS 2.0 feed', () => {
        beforeEach(() => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve(mockRssXml)
            })
        })

        it('should parse the feed title', async () => {
            const feed = await getFeedFromUrl('https://example.com/feed.xml')
            expect(feed.title).toBe('Test RSS Feed')
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
    })

    describe('with Atom feed', () => {
        beforeEach(() => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve(mockAtomXml)
            })
        })

        it('should parse the feed title', async () => {
            const feed = await getFeedFromUrl('https://martinfowler.com/feed.atom')
            expect(feed.title).toBe('Martin Fowler')
        })

        it('should parse all entries', async () => {
            const feed = await getFeedFromUrl('https://martinfowler.com/feed.atom')
            expect(feed.items).toHaveLength(2)
        })

        it('should parse entry fields from Atom format', async () => {
            const feed = await getFeedFromUrl('https://martinfowler.com/feed.atom')
            expect(feed.items[0]).toEqual({
                title: 'Ideological Resistance to Patents',
                description: 'Article about software patents.',
                link: 'https://martinfowler.com/articles/patents-reluctant-pragmatism.html',
                pubDate: '2026-03-05T14:54:00+01:00'
            })
        })
    })

    it('should throw when fetch fails', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false })
        await expect(getFeedFromUrl('https://example.com/feed.xml')).rejects.toThrow()
    })
})
