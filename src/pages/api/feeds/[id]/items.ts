import type { NextApiRequest, NextApiResponse } from 'next'
import { rateLimit, getIp } from '@/src/lib/rate-limiter'
import { container } from '@/src/composition/container'

const GET_LIMIT = 30
const WINDOW_MS = 60_000

// Articles of a subscribed feed: the server only fetches urls stored in feed_subscriptions
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        return res.status(405).json({ error: 'Method Not Allowed' })
    }
    if (!rateLimit(getIp(req), GET_LIMIT, WINDOW_MS)) {
        return res.status(429).json({ error: 'Too Many Requests' })
    }
    return container.feedsController.items(req, res)
}
