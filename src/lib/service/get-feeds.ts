'use server'

import { Feed, FeedItem } from '@/src/core/domain/models/Feed'

function extractTag(xml: string, tag: string): string {
    const match = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'))
    return match ? match[1].trim() : ''
}

function parseItems(xml: string): FeedItem[] {
    const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    return matches.map((m) => ({
        title: extractTag(m[1], 'title'),
        description: extractTag(m[1], 'description'),
        link: extractTag(m[1], 'link'),
        pubDate: extractTag(m[1], 'pubDate')
    }))
}

export async function getFeedFromUrl(url: string): Promise<Feed> {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${url}`)
    }
    const xml = await response.text()
    return {
        title: extractTag(xml, 'title'),
        items: parseItems(xml)
    }
}
