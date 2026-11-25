import type { NextApiRequest, NextApiResponse } from 'next'
import { PersistedFeedSubscription } from '@/src/core/domain/feed/FeedSubscription'
import { FeedAlreadySubscribedError, InvalidFeedSubscriptionError } from '@/src/core/domain/feed/feed-errors'
import { toFeedSubscriptionDto } from '@/src/adapters/presenters/feed-subscription-presenter'

type Deps = {
    subscribeToFeed: (url: string) => Promise<PersistedFeedSubscription>
    listFeedSubscriptions: () => Promise<PersistedFeedSubscription[]>
    unsubscribeFromFeed: (id: number) => Promise<void>
}

export const feedsController = ({ subscribeToFeed, listFeedSubscriptions, unsubscribeFromFeed }: Deps) => ({
    async list(_req: NextApiRequest, res: NextApiResponse) {
        try {
            const subscriptions = await listFeedSubscriptions()
            return res
                .status(200)
                .json({ message: 'Voici vos flux', subscriptions: subscriptions.map(toFeedSubscriptionDto) })
        } catch {
            return res.status(500).json({ error: 'Erreur interne' })
        }
    },

    async subscribe(req: NextApiRequest, res: NextApiResponse) {
        const url = parseSubscribeInput(req.body)
        if (url === null) return res.status(400).json({ error: 'Le champ url est obligatoire' })
        try {
            const subscription = await subscribeToFeed(url)
            return res
                .status(201)
                .json({ message: 'Flux ajouté avec succès', subscription: toFeedSubscriptionDto(subscription) })
        } catch (error) {
            if (error instanceof InvalidFeedSubscriptionError) return res.status(400).json({ error: error.message })
            if (error instanceof FeedAlreadySubscribedError) return res.status(409).json({ error: error.message })
            return res.status(500).json({ error: 'Erreur interne' })
        }
    },

    async unsubscribe(req: NextApiRequest, res: NextApiResponse) {
        const id = parseId(req.query.id)
        if (id === null) return res.status(400).json({ error: 'Invalid id' })
        try {
            await unsubscribeFromFeed(id)
            return res.status(200).json({ message: 'Flux supprimé avec succès' })
        } catch {
            return res.status(500).json({ error: 'Erreur interne' })
        }
    }
})

const parseSubscribeInput = (body: unknown): string | null => {
    let data: unknown = body
    if (typeof body === 'string') {
        try {
            data = JSON.parse(body)
        } catch {
            return null
        }
    }
    if (typeof data !== 'object' || data === null) return null
    const { url } = data as { url?: unknown }
    return typeof url === 'string' ? url : null
}

const parseId = (raw: string | string[] | undefined): number | null => {
    if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) return null
    return Number(raw)
}
