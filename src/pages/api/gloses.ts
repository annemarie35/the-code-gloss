import type { NextApiRequest, NextApiResponse } from 'next'
import { getGlosesInMemory } from '@/src/lib/service/get-gloses'
import { GloseComplete } from '@/src/core/domain/models/Glose'
import { AddGlose } from '@/src/lib/service/add-glose'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    let createOrGetGloseResponse: CreateOrGetGloseResponse
    let statusCode: number
    if (req.method === 'POST') {
        await AddGlose(JSON.parse(req.body))
        statusCode = 201
        createOrGetGloseResponse = { message: 'Glose ajouté avec succès', gloses: [] }
        res.status(statusCode).json(createOrGetGloseResponse)
    } else {
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
