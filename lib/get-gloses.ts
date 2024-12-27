import { databaseClient } from '@/lib/database-client'
import { notFound } from 'next/navigation'

type Glose = {
    id: string
    title: string
    description: string
    created_at: string
    tags: string
}
export const getGloses = async (): Promise<Glose[]> => {
    const gloses = await databaseClient.select('*').from('gloses')

    if (!gloses) notFound()
    return gloses
}
