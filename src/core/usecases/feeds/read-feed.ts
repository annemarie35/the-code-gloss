import { Feed } from '@/src/core/domain/models/Feed'
import { parseFeed } from '@/src/core/domain/feed/parse-feed'
import { FeedSubscriptionNotFoundError } from '@/src/core/domain/feed/feed-errors'
import { FeedSubscriptionRepository } from '@/src/core/ports/feed-subscription-repository'
import { FeedReader } from '@/src/core/ports/feed-reader'

type Deps = { feedSubscriptionRepository: FeedSubscriptionRepository; feedReader: FeedReader }

// Only subscribed feeds are read: the server never fetches an url given in the request
export const readFeed =
    ({ feedSubscriptionRepository, feedReader }: Deps) =>
    async (id: number): Promise<Feed> => {
        const subscription = await feedSubscriptionRepository.findById(id)
        if (!subscription) throw new FeedSubscriptionNotFoundError(id)
        return parseFeed(await feedReader.read(subscription.url))
    }
