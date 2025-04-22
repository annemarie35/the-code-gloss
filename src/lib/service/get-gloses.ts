'use server'

import { selectAllGloses } from '@/infra/database/repositories'

export async function getGlosesInMemory() {
    const gloses = await selectAllGloses()
    return gloses
}
