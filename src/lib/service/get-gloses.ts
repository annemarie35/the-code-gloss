'use server'

import { selectAllGloses } from '@/infra/database/repositories'
import { GloseComplete } from '@/src/core/domain/models/Glose.ts'
import type { QueryResultRow } from 'pg'

export async function getGlosesInMemory(): Promise<GloseComplete[]> {
    const dataDB = await selectAllGloses()
    return mapToGloses(dataDB)
}

const mapToGloses = (dataDB: QueryResultRow[]): GloseComplete[] => {
    const gloses: GloseComplete[] = dataDB.map((data) => data as GloseComplete)
    return gloses
}
