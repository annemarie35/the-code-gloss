'use server'
import { insertGloseDbQuery } from '@/src/lib/database/insert-gloses-db-query'

type GloseForm = {
    title: string
    description: string
    tags: string[]
    created_at?: string
}
export async function createGlose(glose: GloseForm) {
    glose.created_at = new Date().toISOString()
    await insertGloseDbQuery(glose)
}
