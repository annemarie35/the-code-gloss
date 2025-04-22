import { SELECT_ALL } from '@/infra/database/sql_queries'

import { query, end } from '@/infra/database/connectionPool'
import { Glose } from '@/src/lib/database/get-gloses-db-query'

export const selectAllGloses = async (): Promise<Glose[]> => {
    const { rows } = await query(SELECT_ALL('public'))
    await end()
    return rows
}
