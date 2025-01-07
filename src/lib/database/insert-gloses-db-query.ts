import { databaseClient } from '@/src/lib/database/database-client'

export const insertGloseDbQuery = (values: unknown) => {
    try {
        const toto = databaseClient.insert(values).returning('*')
        console.log('toto', toto)
        // https://github.com/vercel/next.js/issues/54784
    } catch (error) {
        throw new Error(`Database error ${error}`)
    }
}
