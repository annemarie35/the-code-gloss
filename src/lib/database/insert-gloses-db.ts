import { databaseClient } from '@/src/lib/database/database-client'

export const insert = (values: unknown) => {
    databaseClient.insert(values).returning('*')
}
