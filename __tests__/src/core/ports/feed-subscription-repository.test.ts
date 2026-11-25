import { describe, expectTypeOf, it } from 'vitest'
import { FeedSubscriptionRepository } from '@/src/core/ports/feed-subscription-repository'
import { FeedSubscription, PersistedFeedSubscription } from '@/src/core/domain/feed/FeedSubscription'
import { pgFeedSubscriptionRepository } from '@/src/infrastructure/postgres/pg-feed-subscription-repository'
import { inMemoryFeedSubscriptionRepository } from '@/__tests__/fakes/in-memory-feed-subscription-repository'

describe('FeedSubscriptionRepository', () => {
    it('should save a subscription without id and give it back with its id', () => {
        expectTypeOf<FeedSubscriptionRepository['save']>().parameter(0).toEqualTypeOf<FeedSubscription>()
        expectTypeOf<FeedSubscriptionRepository['save']>().returns.resolves.toEqualTypeOf<PersistedFeedSubscription>()
    })

    it('should only read subscriptions that have an id', () => {
        expectTypeOf<FeedSubscriptionRepository['findAll']>().returns.resolves.toEqualTypeOf<
            PersistedFeedSubscription[]
        >()
        expectTypeOf<
            FeedSubscriptionRepository['findByUrl']
        >().returns.resolves.toEqualTypeOf<PersistedFeedSubscription | null>()
    })

    it('should delete a subscription by its id', () => {
        expectTypeOf<FeedSubscriptionRepository['delete']>().parameter(0).toEqualTypeOf<number>()
    })

    it('should be implemented by the postgres repository and the in-memory fake', () => {
        expectTypeOf(pgFeedSubscriptionRepository).returns.toEqualTypeOf<FeedSubscriptionRepository>()
        expectTypeOf(inMemoryFeedSubscriptionRepository).returns.toExtend<FeedSubscriptionRepository>()
    })
})
