import type { NextApiRequest, NextApiResponse } from 'next'
import { getGloses, Glose } from '@/src/lib/get-gloses'
import { createGlose } from '@/src/lib/create-glose'

type ResponseData = {
    message?: string
    gloses?: Glose[]
    error?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    let toto: ApiResponse
    if (req.method === 'POST') {
        if (!req.body.title) {
            throw new Error('Missing required field')
            res.status(400).json({ error: 'une erreur' })
        }
        await createGlose(JSON.parse(req.body))
        toto = { message: 'Glose ajouté avec succès', gloses: [] }
        res.status(200).json(toto)
    } else {
        const gloses = await getGloses()
        // need adapter for front
        toto = {
            message: 'Voici vos gloses',
            gloses
        }
        res.status(200).json(toto)
    }
}

type ApiResponse = {
    message: string
    gloses: Glose[]
}
