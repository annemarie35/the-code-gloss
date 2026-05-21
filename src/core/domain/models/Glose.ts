export type GloseComplete = {
    id: number
    title: string
    description: string
    created_at: string
    tags: string
    themes: string[]
}

export const THEMES = ['OPS', 'CRAFT', 'DATABASE', 'DDD', 'AGILE'] as const
export type Theme = (typeof THEMES)[number]
