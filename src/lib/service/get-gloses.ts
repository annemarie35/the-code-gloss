'use server'

import { getGlosesDbQuery } from '@/src/lib/database/get-gloses-db-query'

export async function getGlose() {
    const gloses = await getGlosesDbQuery()
    return gloses
}
