import { describe, expectTypeOf, it } from 'vitest'
import { FeedReader } from '@/src/core/ports/feed-reader'
import { httpFeedReader } from '@/src/infrastructure/rss/http-feed-reader'
import { fakeFeedReader } from '@/__tests__/fakes/fake-feed-reader'

describe('FeedReader', () => {
    it('should read the raw document of a feed from its url', () => {
        expectTypeOf<FeedReader['read']>().parameter(0).toEqualTypeOf<string>()
        expectTypeOf<FeedReader['read']>().returns.resolves.toEqualTypeOf<string>()
    })

    it('should be implemented by the http reader and the fake used in tests', () => {
        expectTypeOf(httpFeedReader).returns.toEqualTypeOf<FeedReader>()
        expectTypeOf(fakeFeedReader).returns.toExtend<FeedReader>()
    })
})
