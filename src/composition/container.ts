import { query } from '@/infra/database/connectionPool'
import { pgFeedSubscriptionRepository } from '@/src/infrastructure/postgres/pg-feed-subscription-repository'
import { systemClock } from '@/src/infrastructure/system-clock'
import { subscribeToFeed } from '@/src/core/usecases/feeds/subscribe-to-feed'
import { listFeedSubscriptions } from '@/src/core/usecases/feeds/list-feed-subscriptions'
import { unsubscribeFromFeed } from '@/src/core/usecases/feeds/unsubscribe-from-feed'
import { feedsController } from '@/src/adapters/api/feeds-controller'

const feedSubscriptionRepository = pgFeedSubscriptionRepository(query)

export const container = {
    feedsController: feedsController({
        subscribeToFeed: subscribeToFeed({ feedSubscriptionRepository, clock: systemClock }),
        listFeedSubscriptions: listFeedSubscriptions({ feedSubscriptionRepository }),
        unsubscribeFromFeed: unsubscribeFromFeed({ feedSubscriptionRepository })
    })
}
