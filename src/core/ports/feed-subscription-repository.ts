import { FeedSubscription } from '@/src/core/domain/feed/FeedSubscription'

export interface FeedSubscriptionRepository {
    save(subscription: FeedSubscription): Promise<FeedSubscription>
    findAll(): Promise<FeedSubscription[]>
    findByUrl(url: string): Promise<FeedSubscription | null>
    delete(id: number): Promise<void>
}
