'use server'
import { databaseClient } from '@/src/lib/database/database-client'
import knex from 'knex'
import { dbConfig } from '@/src/lib/database/database-config'

export type Glose = {
    id: number
    title: string
    description: string
    created_at: string
    tags: string
}
export const getGlosesDbQuery = async (): Promise<Glose[]> => {
    try {
        const { rows } = await knex(dbConfig)
            .raw('select * from gloses')
            .then((resp) => resp)

        console.log(rows)
        const gloses = await databaseClient.select('*')
        console.log('gloses', gloses)
        // act like if last knex query is still in memory so it is not a select that is done when page is refresh, it create some more entries
        return rows
    } catch (error) {
        console.error('>>>>>>>>>>>>>>>>>>>>>', error)
        throw new Error('Database error')
    }
}
