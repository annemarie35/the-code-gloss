export const THEMES = [
    'OPS',
    'CRAFT',
    'DATABASE',
    'DDD',
    'AGILE',
    'DESIGN',
    'TEST',
    'WEB',
    'ARCHITECTURE',
    'SOFTWARE_ENGINEERING'
] as const
export type Theme = (typeof THEMES)[number]

// Theme values are stored as identifiers (no spaces); the label is what users see
export const themeLabel = (theme: Theme): string => theme.replace(/_/g, ' ')

export const isTheme = (value: unknown): value is Theme =>
    typeof value === 'string' && (THEMES as readonly string[]).includes(value)

export const areValidThemes = (themes: unknown): boolean =>
    themes === undefined || (Array.isArray(themes) && themes.every(isTheme))
// TODO Pourrait être remplacé par la verif typescript et/ou zod

export type GloseComplete = {
    id: number
    title: string
    description: string
    created_at: string
    tags: string
    themes: Theme[]
}
