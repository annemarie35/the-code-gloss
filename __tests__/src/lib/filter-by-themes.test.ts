import { describe, it, expect } from 'vitest'
import { filterByThemes } from '@/src/lib/filter-by-themes'
import { GloseComplete } from '@/src/core/domain/models/Glose'

const gloses: GloseComplete[] = [
    {
        id: 1,
        title: 'TDD',
        description: 'Test Driven Development',
        created_at: '2024-01-01',
        tags: '',
        themes: ['CRAFT']
    },
    {
        id: 2,
        title: 'Kubernetes',
        description: 'Container orchestration',
        created_at: '2024-01-02',
        tags: '',
        themes: ['OPS']
    },
    {
        id: 3,
        title: 'PostgreSQL',
        description: 'Relational database',
        created_at: '2024-01-03',
        tags: '',
        themes: ['DATABASE']
    },
    {
        id: 4,
        title: 'Scrum',
        description: 'Agile framework',
        created_at: '2024-01-04',
        tags: '',
        themes: ['AGILE', 'CRAFT']
    },
    { id: 5, title: 'Glossaire', description: 'No theme', created_at: '2024-01-05', tags: '', themes: [] }
]

describe('filterByThemes', () => {
    it('devrait retourner tous les gloses quand aucun thème est sélectionné', () => {
        expect(filterByThemes(gloses, [])).toEqual(gloses)
    })

    it('devrait filtrer les gloses par un seul thème', () => {
        const result = filterByThemes(gloses, ['CRAFT'])
        expect(result).toHaveLength(2)
        expect(result.map((g) => g.id)).toEqual([1, 4])
    })

    it('devrait filtrer les gloses par plusieurs thèmes', () => {
        const result = filterByThemes(gloses, ['OPS', 'DATABASE'])
        expect(result).toHaveLength(2)
        expect(result.map((g) => g.id)).toEqual([2, 3])
    })

    it('devrait inclure un glose si au moins un de ses thèmes correspond', () => {
        const result = filterByThemes(gloses, ['AGILE'])
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(4)
    })

    it('devrait retourner une liste vide si aucun glose ne correspond', () => {
        const result = filterByThemes(gloses, ['DDD'])
        expect(result).toHaveLength(0)
    })

    it('devrait gérer les gloses sans thèmes', () => {
        const result = filterByThemes(gloses, ['CRAFT'])
        expect(result.find((g) => g.id === 5)).toBeUndefined()
    })
})
