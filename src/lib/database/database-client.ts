import knex from 'knex'
import { dbConfig } from '@/src/lib/database/database-config'

export const databaseClient = knex(dbConfig)('gloses')
