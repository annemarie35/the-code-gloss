import { describe, expect, it } from 'vitest'
import { parseFeed } from '@/src/core/domain/feed/parse-feed'

const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
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

const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
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
    <content type="html">Full content</content>
    <summary>Another article summary.</summary>
  </entry>
  <entry>
    <title>No link</title>
  </entry>
</feed>`

describe('parseFeed', () => {
    describe('with an RSS 2.0 feed', () => {
        it('should read the feed title and every item, including CDATA', () => {
            expect(parseFeed(rssXml)).toEqual({
                title: 'Test RSS Feed',
                items: [
                    {
                        title: 'Article 1',
                        description: 'Description 1',
                        link: 'https://example.com/1',
                        pubDate: 'Mon, 01 Jan 2025 00:00:00 UTC'
                    },
                    {
                        title: 'Article 2',
                        description: 'Description 2',
                        link: 'https://example.com/2',
                        pubDate: 'Tue, 02 Jan 2025 00:00:00 UTC'
                    }
                ]
            })
        })
    })

    describe('with an Atom feed', () => {
        const feed = parseFeed(atomXml)

        it('should read the feed title and every entry', () => {
            expect(feed.title).toBe('Martin Fowler')
            expect(feed.items).toHaveLength(3)
        })

        it('should read the entry fields', () => {
            expect(feed.items[0]).toEqual({
                title: 'Ideological Resistance to Patents',
                description: 'Article about software patents.',
                link: 'https://martinfowler.com/articles/patents-reluctant-pragmatism.html',
                pubDate: '2026-03-05T14:54:00+01:00'
            })
        })

        it('should prefer the content to the summary', () => {
            expect(feed.items[1].description).toBe('Full content')
        })

        it('should give an empty link when the entry has none', () => {
            expect(feed.items[2].link).toBe('')
        })
    })

    it('should give no item when the document has none', () => {
        expect(parseFeed('<rss><channel><title>Empty</title></channel></rss>')).toEqual({ title: 'Empty', items: [] })
    })
})
