import type { NextApiRequest, NextApiResponse } from 'next'
import { getGloses, Glose } from '@/src/lib/database/get-gloses'
import { createGlose } from '@/src/lib/service/create-glose'

type ResponseData = {
    message?: string
    gloses?: Glose[]
    error?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    let toto: CreateGloseResponse
    let statusCode: number
    // TODO Clean that or move to node server
    if (req.method === 'POST') {
        // if (!req.body.title) {
        //     throw new Error('Missing required field')
        //     res.status(400).json({ error: 'une erreur' })
        // }
        await createGlose(JSON.parse(req.body))
        statusCode = 201
        toto = { message: 'Glose ajouté avec succès', gloses: [] }
        res.status(statusCode).json(toto)
    } else {
        const gloses = await getGloses()
        statusCode = 200
        // need adapter for front
        res.status(statusCode).json({
            message: 'Voici vos gloses',
            gloses
        })
    }
}

type CreateGloseResponse = {
    message: string
    gloses: Glose[]
}
