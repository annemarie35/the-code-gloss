'use server'
import { insertGlosesDbQuery } from '@/src/lib/database/insert-gloses-db-query'

type GloseForm = {
    title: string
    description: string
    tags: string[]
    created_at?: string
}

export async function createGlose(glose: GloseForm) {
    await insertGlosesDbQuery(glose)
}
