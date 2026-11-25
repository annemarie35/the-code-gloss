import { InvalidFeedSubscriptionError } from './feed-errors'

export type FeedSubscription = {
    id?: number
    url: string
    createdAt: Date
}

export type PersistedFeedSubscription = FeedSubscription & { id: number }

const MAX_URL_LENGTH = 500
const ALLOWED_PROTOCOLS = ['http:', 'https:']

export const normalizeFeedUrl = (rawUrl: string): string => {
    const url = rawUrl.trim()
    try {
        return new URL(url).href
    } catch {
        return url
    }
}

export const createFeedSubscription = (rawUrl: string, now: Date): FeedSubscription => {
    const trimmed = rawUrl.trim()
    if (!trimmed) throw new InvalidFeedSubscriptionError("L'URL du flux est obligatoire")

    let parsed: URL
    try {
        parsed = new URL(trimmed)
    } catch {
        throw new InvalidFeedSubscriptionError(`URL de flux invalide : ${trimmed}`)
    }
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
        throw new InvalidFeedSubscriptionError('Seules les URLs http et https sont acceptées')
    }

    const url = parsed.href
    if (url.length > MAX_URL_LENGTH) {
        throw new InvalidFeedSubscriptionError(`L'URL du flux ne doit pas dépasser ${MAX_URL_LENGTH} caractères`)
    }

    return { url, createdAt: now }
}
