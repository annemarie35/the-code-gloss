import { GloseComplete } from '@/src/core/domain/models/Glose'

export function filterByThemes(gloses: GloseComplete[], selectedThemes: string[]): GloseComplete[] {
    if (selectedThemes.length === 0) return gloses
    return gloses.filter((glose) => glose.themes?.some((theme) => selectedThemes.includes(theme)))
}
