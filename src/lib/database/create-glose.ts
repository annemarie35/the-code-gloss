'use server'
import { insert } from '@/src/lib/database/insert-gloses-db'

type GloseForm = {
    title: string
    description: string
    tags: string[]
    created_at?: string
}
export async function createGlose(glose: GloseForm) {
    glose.created_at = new Date().toISOString()
    await insert(glose)
}
