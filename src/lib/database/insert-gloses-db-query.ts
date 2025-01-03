import { databaseClient } from '@/src/lib/database/database-client'

export const insertGloseDbQuery = (values: unknown) => {
    databaseClient.insert(values).returning('*')
}
