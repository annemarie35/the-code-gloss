import type { NextApiRequest, NextApiResponse } from 'next'
import { Glose } from '@/src/lib/database/get-gloses-db-query'
import { createGlose } from '@/src/lib/service/create-glose'
import { getGlose } from '@/src/lib/service/get-gloses'

type ResponseData = {
    message?: string
    gloses?: Glose[]
    error?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    let createOrGetGloseResponse: CreateOrGetGloseResponse
    let statusCode: number
    if (req.method === 'POST') {
        await createGlose(JSON.parse(req.body))
        statusCode = 201
        createOrGetGloseResponse = { message: 'Glose ajouté avec succès', gloses: [] }
        res.status(statusCode).json(createOrGetGloseResponse)
    } else {
        const gloses = await getGlose()
        statusCode = 200
        // need adapter for front
        createOrGetGloseResponse = {
            message: 'Voici vos gloses',
            gloses
        }
        res.status(statusCode).json(createOrGetGloseResponse)
    }
}

type CreateOrGetGloseResponse = {
    message: string
    gloses: Glose[]
}
