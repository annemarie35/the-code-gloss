'use server'
import { databaseClient } from '@/src/lib/database-client'

export type Glose = {
    id: number
    title: string
    description: string
    created_at: string
    tags: string
}
export const getGloses = async (): Promise<Glose[]> => {
    try {
        const gloses = await databaseClient.select('*')
        return gloses
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        throw new Error('Database error')
    }
}
