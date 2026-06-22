import type { NextApiRequest, NextApiResponse } from 'next'
import { getFeedFromUrl } from '@/src/lib/service/get-feeds'
import { Feed } from '@/src/core/domain/models/Feed'
import { rateLimit, getIp } from '@/src/lib/rate-limiter'

const GET_LIMIT = 30
const WINDOW_MS = 60_000

export default async function handler(req: NextApiRequest, res: NextApiResponse<Feed | { error: string }>) {
    if (!rateLimit(getIp(req), GET_LIMIT, WINDOW_MS)) {
        return res.status(429).json({ error: 'Too Many Requests' })
    }

    const { url } = req.query
    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing url parameter' })
    }

    let feedUrl: URL
    try {
        feedUrl = new URL(url)
        if (!['http:', 'https:'].includes(feedUrl.protocol)) {
            return res.status(400).json({ error: 'Invalid URL protocol' })
        }
    } catch {
        return res.status(400).json({ error: 'Invalid URL' })
    }

    try {
        const feed = await getFeedFromUrl(feedUrl.toString())
        return res.status(200).json(feed)
    } catch {
        return res.status(502).json({ error: 'Failed to fetch feed' })
    }
}
