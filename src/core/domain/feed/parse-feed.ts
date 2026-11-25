import { Feed, FeedItem } from '@/src/core/domain/models/Feed'

function extractTag(xml: string, tag: string): string {
    const match = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'))
    return match ? match[1].trim() : ''
}

function extractAtomLink(xml: string): string {
    const match = xml.match(/<link[^>]+href="([^"]+)"[^>]*\/?>/i)
    return match ? match[1].trim() : ''
}

function parseRssItems(xml: string): FeedItem[] {
    const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    return matches.map((m) => ({
        title: extractTag(m[1], 'title'),
        description: extractTag(m[1], 'description'),
        link: extractTag(m[1], 'link'),
        pubDate: extractTag(m[1], 'pubDate')
    }))
}

function parseAtomEntries(xml: string): FeedItem[] {
    const matches = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)]
    return matches.map((m) => ({
        title: extractTag(m[1], 'title'),
        description: extractTag(m[1], 'content') || extractTag(m[1], 'summary'),
        link: extractAtomLink(m[1]),
        pubDate: extractTag(m[1], 'updated')
    }))
}

function isAtomFeed(xml: string): boolean {
    return /xmlns="http:\/\/www\.w3\.org\/2005\/Atom"/i.test(xml)
}

// Regex parsing moved as is from src/lib/service/get-feeds.ts: plan item 9 replaces it with an XML parser
export function parseFeed(xml: string): Feed {
    const items = isAtomFeed(xml) ? parseAtomEntries(xml) : parseRssItems(xml)
    return {
        title: extractTag(xml, 'title'),
        items
    }
}
