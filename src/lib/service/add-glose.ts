import { insertGlose } from '@/infra/database/repositories'

export const AddGlose = async (glose: Glose) => {
    glose.created_at = new Date().toISOString()
    await insertGlose(glose)
    //TODO throw new Error(`Database error ${error}`)
    return 'succes'
}

type Glose = {
    title: string
    description: string
    tags: string
    created_at: string
}
