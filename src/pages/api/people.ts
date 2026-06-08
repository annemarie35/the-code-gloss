import type { NextApiRequest, NextApiResponse } from 'next'
import { addPerson } from '@/src/core/domain/usecases/add-person.ts'
import { rateLimit, getIp } from '@/src/lib/rate-limiter'
const POST_LIMIT = 10
const WINDOW_MS = 60_000

function isValidOrigin(req: NextApiRequest): boolean {
    const origin = req.headers['origin']
    const host = req.headers['host']
    if (!origin || !host) return false
    try {
        return new URL(origin).host === host
    } catch {
        return false
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const ip = getIp(req)

    if (req.method === 'POST') {
        if (!rateLimit(ip, POST_LIMIT, WINDOW_MS)) {
            return res.status(429).json({ error: 'Too Many Requests' })
        }
        if (!isValidOrigin(req)) {
            return res.status(403).json({ error: 'Forbidden' })
        }
        await addPerson(JSON.parse(req.body))
        return res.status(201).json({ message: 'Personne ajoutée avec succès' })
    }

    return res.status(405).json({ error: 'Method Not Allowed' })
}

type ResponseData = {
    message?: string
    error?: string
}
