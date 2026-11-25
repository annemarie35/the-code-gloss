import { PersistedFeedSubscription } from '@/src/core/domain/feed/FeedSubscription'
import { FeedSubscriptionRepository } from '@/src/core/ports/feed-subscription-repository'

type Deps = { feedSubscriptionRepository: FeedSubscriptionRepository }

export const listFeedSubscriptions =
    ({ feedSubscriptionRepository }: Deps) =>
    async (): Promise<PersistedFeedSubscription[]> =>
        feedSubscriptionRepository.findAll()
