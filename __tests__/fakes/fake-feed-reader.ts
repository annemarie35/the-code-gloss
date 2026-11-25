import { FeedReader } from '@/src/core/ports/feed-reader'
import { FeedUnavailableError } from '@/src/core/domain/feed/feed-errors'

export const fakeFeedReader = (documentsByUrl: Record<string, string>): FeedReader & { readUrls: string[] } => {
    const readUrls: string[] = []
    return {
        readUrls,
        async read(url) {
            readUrls.push(url)
            const document = documentsByUrl[url]
            if (document === undefined) throw new FeedUnavailableError(url, 'inconnu du faux lecteur')
            return document
        }
    }
}
