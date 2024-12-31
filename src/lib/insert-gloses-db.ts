import { databaseClient } from '@/src/lib/database-client'

export const insert = (values: unknown) => {
    databaseClient.insert(values).returning('*')
}
