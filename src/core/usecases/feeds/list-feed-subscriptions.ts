import { FeedSubscription } from '@/src/core/domain/feed/FeedSubscription'
import { FeedSubscriptionRepository } from '@/src/core/ports/feed-subscription-repository'

type Deps = { feedSubscriptionRepository: FeedSubscriptionRepository }

export const listFeedSubscriptions =
    ({ feedSubscriptionRepository }: Deps) =>
    async (): Promise<FeedSubscription[]> =>
        feedSubscriptionRepository.findAll()
