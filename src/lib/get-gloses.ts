import { notFound } from 'next/navigation'
import { databaseClient } from '@/src/lib/database-client'

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
