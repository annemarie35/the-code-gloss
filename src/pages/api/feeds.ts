import type { NextApiRequest, NextApiResponse } from 'next'
import { rateLimit, getIp } from '@/src/lib/rate-limiter'
import { isSameOrigin } from '@/src/infrastructure/http/origin-check'
import { container } from '@/src/composition/container'

const GET_LIMIT = 30
const WRITE_LIMIT = 10
const WINDOW_MS = 60_000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const ip = getIp(req)

    if (req.method === 'GET') {
        if (!rateLimit(ip, GET_LIMIT, WINDOW_MS)) {
            return res.status(429).json({ error: 'Too Many Requests' })
        }
        return container.feedsController.list(req, res)
    }

    if (req.method === 'POST' || req.method === 'DELETE') {
        if (!rateLimit(ip, WRITE_LIMIT, WINDOW_MS)) {
            return res.status(429).json({ error: 'Too Many Requests' })
        }
        if (!isSameOrigin(req.headers)) {
            return res.status(403).json({ error: 'Forbidden' })
        }
        if (req.method === 'POST') return container.feedsController.subscribe(req, res)
        return container.feedsController.unsubscribe(req, res)
    }

    res.setHeader('Allow', 'GET, POST, DELETE')
    return res.status(405).json({ error: 'Method Not Allowed' })
}
