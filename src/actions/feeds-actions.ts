'use server'
import { httpClient } from '@/src/lib/http'
import { Feed } from '@/src/core/domain/models/Feed'

export async function getFeed(url: string): Promise<FeedResponse> {
    try {
        const feed = await httpClient({
            url: `http://localhost:3000/api/feeds?url=${encodeURIComponent(url)}`,
            requestConfig: {
                method: 'GET',
                headers: new Headers(),
                mode: 'cors'
            }
        })
        return { feed, error: null }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        return { feed: null, error: 'Une erreur est survenue en récupérant le flux' }
    }
}

export type FeedResponse = {
    feed: Feed | null
    error: null | string
}
