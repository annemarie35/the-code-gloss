import { INSERT_GLOSE, SELECT_ALL } from '@/infra/database/sql_queries'

import { query } from '@/infra/database/connectionPool'
import { GloseComplete } from '@/src/core/domain/models/Glose'
import type { QueryResultRow } from 'pg'

export const selectAllGloses = async (): Promise<QueryResultRow[]> => {
    const { rows } = await query(SELECT_ALL('public'), [])
    return rows
}

export const insertGlose = async (glose: Omit<GloseComplete, 'id'>): Promise<undefined> => {
    await query(INSERT_GLOSE('public'), [glose.description, glose.title, glose.tags, glose.created_at])
}
