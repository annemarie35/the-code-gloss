import { databaseClient } from '@/src/lib/database/database-client'

export const insertGlosesDbQuery = (values: Glose) => {
    try {
        values.created_at = new Date().toISOString()
        databaseClient.insert(values).returning('*')
    } catch (error) {
        throw new Error(`Database error ${error}`)
    }
}

type Glose = {
    title: string
    description: string
    tags: string[]
    created_at?: string
}
