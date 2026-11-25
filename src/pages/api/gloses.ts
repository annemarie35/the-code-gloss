import type { NextApiRequest, NextApiResponse } from 'next'
import { getGlosesInMemory } from '@/src/lib/service/get-gloses'
import { GloseComplete } from '@/src/core/domain/models/Glose'
import { AddGlose } from '@/src/lib/service/add-glose'
import { rateLimit, getIp } from '@/src/lib/rate-limiter'
import { isSameOrigin } from '@/src/infrastructure/http/origin-check.ts'

const POST_LIMIT = 10
const GET_LIMIT = 60
const WINDOW_MS = 60_000

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const ip = getIp(req)
    let createOrGetGloseResponse: CreateOrGetGloseResponse
    let statusCode: number
    if (req.method === 'POST') {
        if (!rateLimit(ip, POST_LIMIT, WINDOW_MS)) {
            return res.status(429).json({ error: 'Too Many Requests' })
        }
        if (!isSameOrigin(req.headers)) {
            return res.status(403).json({ error: 'Forbidden' })
        }
        await AddGlose(JSON.parse(req.body))
        statusCode = 201
        createOrGetGloseResponse = { message: 'Glose ajouté avec succès', gloses: [] }
        res.status(statusCode).json(createOrGetGloseResponse)
    } else {
        if (!rateLimit(ip, GET_LIMIT, WINDOW_MS)) {
            return res.status(429).json({ error: 'Too Many Requests' })
        }
        const gloses = await getGlosesInMemory()
        statusCode = 200
        const createOrGetGloseResponse = {
            message: 'Voici vos gloses',
            gloses
        }
        res.status(statusCode).json(createOrGetGloseResponse)
    }
}

type CreateOrGetGloseResponse = {
    message: string
    gloses: GloseComplete[]
}

type ResponseData = {
    message?: string
    gloses?: GloseComplete[]
    error?: string
}
