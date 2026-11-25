import { FeedSubscription, PersistedFeedSubscription } from '@/src/core/domain/feed/FeedSubscription'

export interface FeedSubscriptionRepository {
    save(subscription: FeedSubscription): Promise<PersistedFeedSubscription>
    findAll(): Promise<PersistedFeedSubscription[]>
    findByUrl(url: string): Promise<PersistedFeedSubscription | null>
    findById(id: number): Promise<PersistedFeedSubscription | null>
    delete(id: number): Promise<void>
}
