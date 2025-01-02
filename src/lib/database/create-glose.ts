'use server'
import { insert } from '@/src/lib/database/insert-gloses-db'

type GloseForm = {
    title: string
    description: string
    tags: string[]
}
export async function createGlose(glose: GloseForm) {
    await insert(glose)
}
