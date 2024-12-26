import knex from 'knex'
import { dbConfig } from '@/lib/database-config'

export const databaseClient = knex(dbConfig)
