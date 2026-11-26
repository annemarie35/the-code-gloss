import type { NextApiRequest, NextApiResponse } from 'next'
import { addPerson } from '@/src/core/domain/usecases/add-person.ts'
import { deletePerson } from '@/src/core/domain/usecases/delete-person.ts'
import { getPeopleInMemory } from '@/src/lib/service/get-people'
import { rateLimit, getIp } from '@/src/lib/rate-limiter'
import { Person } from '@/src/core/domain/Types/Person'
import { isSameOrigin } from '@/src/infrastructure/http/origin-check.ts'

const WRITE_LIMIT = 10
const GET_LIMIT = 60
const WINDOW_MS = 60_000

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    const ip = getIp(req)

    if (req.method === 'POST') {
        if (!isSameOrigin(req.headers)) {
            return res.status(403).json({ error: 'Forbidden' })
        }
        if (!rateLimit(ip, WRITE_LIMIT, WINDOW_MS)) {
            return res.status(429).json({ error: 'Too Many Requests' })
        }
        await addPerson(JSON.parse(req.body))
        return res.status(201).json({ message: 'Personne ajoutée avec succès' })
    }

    if (req.method === 'DELETE') {
        if (!isSameOrigin(req.headers)) {
            return res.status(403).json({ error: 'Forbidden' })
        }
        if (!rateLimit(ip, WRITE_LIMIT, WINDOW_MS)) {
            return res.status(429).json({ error: 'Too Many Requests' })
        }
        const id = parseInt(req.query.id as string, 10)
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid id' })
        }
        await deletePerson(id)
        return res.status(200).json({ message: 'Personne supprimée avec succès' })
    }

    if (req.method === 'GET') {
        if (!rateLimit(ip, GET_LIMIT, WINDOW_MS)) {
            return res.status(429).json({ error: 'Too Many Requests' })
        }
        const people = await getPeopleInMemory()
        return res.status(200).json({ message: 'Voici vos personnes', people })
    }

    res.setHeader('Allow', 'GET, POST, DELETE')
    return res.status(405).json({ error: 'Method Not Allowed' })
}

type ResponseData = {
    message?: string
    people?: Person[]
    error?: string
}
