import knex from 'knex'
import { dbConfig } from '@/src/lib/database-config'

export const databaseClient = knex(dbConfig)
