import { Glose } from '@/src/lib/database/get-gloses-db-query'

export function createMockFetchResponse(options: Partial<Template> = {}) {
    return {
        json: options.ok ? () => new Promise((resolve) => resolve({ gloses: options.data })) : undefined,
        ok: true,
        status: options.ok ? 200 : 500,
        ...options
    }
}

type Data = Record<string, unknown>[]
type Template = {
    status: number
    ok: boolean
    data?: Data
    json?: (() => Promise<unknown>) | undefined | (() => Data)
}

export const gloses: Glose[] = [
    {
        created_at: '2025-01-02T15:52:46.963Z',
        description: 'Invented by Alistair Cockburn in 2005',
        id: 8,
        tags: 'Craft, Architecture',
        title: 'Hexagonale architecture'
    }
]
