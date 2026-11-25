import { FeedSubscriptionRepository } from '@/src/core/ports/feed-subscription-repository'

type Deps = { feedSubscriptionRepository: FeedSubscriptionRepository }

export const unsubscribeFromFeed =
    ({ feedSubscriptionRepository }: Deps) =>
    async (id: number): Promise<void> => {
        await feedSubscriptionRepository.delete(id)
    }
