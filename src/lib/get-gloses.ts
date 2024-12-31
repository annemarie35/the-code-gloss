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
    const gloses = await databaseClient.select('*')

    return gloses
}
