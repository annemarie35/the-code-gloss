import type { NextApiRequest, NextApiResponse } from 'next'
import { getGlosesInMemory } from '@/src/lib/service/get-gloses'
import { GloseComplete } from '@/src/core/domain/models/Glose'
import { AddGlose } from '@/src/lib/service/add-glose'
import { rateLimit, getIp } from '@/src/lib/rate-limiter'
import { isSameOrigin } from '@/src/infrastructure/http/origin-check'

const GET_LIMIT = 60
const WINDOW_MS = 60_000

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const ip = getIp(req)

    if (req.method === 'POST') {
        if (!isSameOrigin(req.headers)) {
            return res.status(403).json({ error: 'Forbidden' })
        }
        await AddGlose(JSON.parse(req.body))
        return res.status(201).json({ message: 'Glose ajouté avec succès', gloses: [] })
    }

    if (req.method === 'GET') {
        if (!rateLimit(ip, GET_LIMIT, WINDOW_MS)) {
            return res.status(429).json({ error: 'Too Many Requests' })
        }
        const gloses = await getGlosesInMemory()
        return res.status(200).json({ message: 'Voici vos gloses', gloses })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
}

type ResponseData = {
    message?: string
    gloses?: GloseComplete[]
    error?: string
}
