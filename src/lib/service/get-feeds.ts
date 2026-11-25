import { Feed } from '@/src/core/domain/models/Feed'
import { parseFeed } from '@/src/core/domain/feed/parse-feed'

export async function getFeedFromUrl(url: string): Promise<Feed> {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${url}`)
    }
    return parseFeed(await response.text())
}
