export const THEMES = ['OPS', 'CRAFT', 'DATABASE', 'DDD', 'AGILE', 'DESIGN'] as const
export type Theme = (typeof THEMES)[number]

export type GloseComplete = {
    id: number
    title: string
    description: string
    created_at: string
    tags: string
    themes: Theme[]
}
