import { httpClient } from '@/src/lib/http'
import { Feed } from '@/src/core/domain/models/Feed'
import type { FeedSubscriptionDto } from '@/src/adapters/presenters/feed-subscription-presenter'

// Relative: called from the browser on the same origin, so it works outside localhost
const FEEDS_API_URL = '/api/feeds'

const jsonHeaders = () => {
    const headers = new Headers()
    headers.append('Accept', 'application/json')
    return headers
}

export async function getFeed(url: string): Promise<FeedResponse> {
    try {
        const feed = await httpClient({
            url: `${FEEDS_API_URL}?url=${encodeURIComponent(url)}`,
            requestConfig: { method: 'GET', headers: new Headers(), mode: 'cors' }
        })
        return { feed, error: null }
    } catch {
        return { feed: null, error: 'Une erreur est survenue en récupérant le flux' }
    }
}

export async function listFeedSubscriptions(): Promise<FeedSubscriptionsResponse> {
    try {
        const { subscriptions } = await httpClient({
            url: FEEDS_API_URL,
            requestConfig: { method: 'GET', headers: jsonHeaders(), mode: 'cors' }
        })
        return { subscriptions, error: null }
    } catch {
        return { subscriptions: [], error: 'Une erreur est survenue en récupérant vos flux' }
    }
}

export async function subscribeToFeed(url: string): Promise<SubscribeResponse> {
    try {
        const { subscription } = await httpClient({
            url: FEEDS_API_URL,
            requestConfig: { method: 'POST', headers: jsonHeaders(), mode: 'cors', body: JSON.stringify({ url }) }
        })
        return { subscription, error: null }
    } catch {
        return { subscription: null, error: "Une erreur est survenue dans l'ajout du flux" }
    }
}

export async function unsubscribeFromFeed(id: number): Promise<UnsubscribeResponse> {
    try {
        await httpClient({
            url: `${FEEDS_API_URL}?id=${id}`,
            requestConfig: { method: 'DELETE', headers: jsonHeaders(), mode: 'cors' }
        })
        return { error: null }
    } catch {
        return { error: 'Une erreur est survenue dans la suppression du flux' }
    }
}

export type FeedResponse = { feed: Feed | null; error: null | string }
export type FeedSubscriptionsResponse = { subscriptions: FeedSubscriptionDto[]; error: null | string }
export type SubscribeResponse = { subscription: FeedSubscriptionDto | null; error: null | string }
export type UnsubscribeResponse = { error: null | string }
