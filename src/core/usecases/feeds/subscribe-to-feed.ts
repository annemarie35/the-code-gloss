import { createFeedSubscription, PersistedFeedSubscription } from '@/src/core/domain/feed/FeedSubscription'
import { FeedAlreadySubscribedError } from '@/src/core/domain/feed/feed-errors'
import { FeedSubscriptionRepository } from '@/src/core/ports/feed-subscription-repository'
import { Clock } from '@/src/core/ports/clock'

type Deps = { feedSubscriptionRepository: FeedSubscriptionRepository; clock: Clock }

export const subscribeToFeed =
    ({ feedSubscriptionRepository, clock }: Deps) =>
    async (url: string): Promise<PersistedFeedSubscription> => {
        const subscription = createFeedSubscription(url, clock.now())
        if (await feedSubscriptionRepository.findByUrl(subscription.url)) {
            throw new FeedAlreadySubscribedError(subscription.url)
        }
        return feedSubscriptionRepository.save(subscription)
    }
