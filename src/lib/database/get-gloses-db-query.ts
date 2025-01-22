'use server'
import { databaseClient } from '@/src/lib/database/database-client'

export type Glose = {
    id: number
    title: string
    description: string
    created_at: string
    tags: string
}
export const getGlosesDbQuery = async (): Promise<Glose[]> => {
    try {
        const gloses = databaseClient.select('*')
        // act like if last knex query is still in memory so it is not a select that is done when page is refresh, it create some more entries
        return gloses
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        throw new Error('Database error')
    }
}
