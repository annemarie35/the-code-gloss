import { InvalidFeedSubscriptionError } from './feed-errors'

export type FeedSubscription = {
    id?: number
    url: string
    createdAt: Date
}

const MAX_URL_LENGTH = 500
const ALLOWED_PROTOCOLS = ['http:', 'https:']

export const createFeedSubscription = (rawUrl: string, now: Date): FeedSubscription => {
    const url = rawUrl.trim()
    if (!url) throw new InvalidFeedSubscriptionError("L'URL du flux est obligatoire")
    if (url.length > MAX_URL_LENGTH) {
        throw new InvalidFeedSubscriptionError(`L'URL du flux ne doit pas dépasser ${MAX_URL_LENGTH} caractères`)
    }

    let protocol: string
    try {
        protocol = new URL(url).protocol
    } catch {
        throw new InvalidFeedSubscriptionError(`URL de flux invalide : ${url}`)
    }
    if (!ALLOWED_PROTOCOLS.includes(protocol)) {
        throw new InvalidFeedSubscriptionError('Seules les URLs http et https sont acceptées')
    }

    return { url, createdAt: now }
}
