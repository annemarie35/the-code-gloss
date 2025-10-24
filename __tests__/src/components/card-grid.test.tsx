import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CardGrid, { transformData } from '@/src/components/card-grid.tsx'
import { GloseComplete } from '@/src/core/domain/models/Glose.ts'

const mockCards: GloseComplete[] = [
    {
        id: 1,
        title: 'Test Card 1',
        description: 'Description du test card 1',
        created_at: new Date('2023-05-10').toString(),
        tags: 'Test, React'
    },
    {
        id: 2,
        title: 'Test Card 2',
        description: 'Description du test card 2',
        created_at: new Date('2023-06-15').toString(),
        tags: 'TypeScript'
    }
]

describe('CardGrid Component', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    it("devrait rendre le composant avec les données par défaut quand aucune prop n'est fournie", () => {
        render(<CardGrid />)
        expect(screen.getByText('Hexagonale architecture')).toBeInTheDocument()

        expect(screen.getByText('Invented by Alistair Cockburn in 2005')).toBeInTheDocument()
    })

    it('devrait rendre les cartes à partir des props fournies', () => {
        render(<CardGrid cards={mockCards} />)

        expect(screen.getByText('Test Card 1')).toBeInTheDocument()
        expect(screen.getByText('Test Card 2')).toBeInTheDocument()

        expect(screen.getByText('Description du test card 1')).toBeInTheDocument()
        expect(screen.getByText('Description du test card 2')).toBeInTheDocument()
    })

    it('devrait formater correctement les dates', () => {
        render(<CardGrid cards={mockCards} />)

        // Vérifier que les dates sont formatées correctement en français
        expect(screen.getByText(/10 mai 2023/)).toBeInTheDocument()
        expect(screen.getByText(/15 juin 2023/)).toBeInTheDocument()
    })

    it('devrait afficher les tags pour chaque carte', () => {
        render(<CardGrid cards={mockCards} />)

        // Vérifier que les tags sont présents
        expect(screen.getByText('Test')).toBeInTheDocument()
        expect(screen.getByText('React')).toBeInTheDocument()
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })

    it('devrait appliquer le bon layout de grid responsive', () => {
        const { container } = render(<CardGrid cards={mockCards} />)

        const gridElement = container.querySelector('.grid')

        expect(gridElement).toHaveClass('grid')
        expect(gridElement).toHaveClass('grid-cols-1')
        expect(gridElement).toHaveClass('md:grid-cols-2')
        expect(gridElement).toHaveClass('lg:grid-cols-3')
    })

    describe('transformData', () => {
        it('should map gloses for better tags display', () => {
            const rawData = [
                {
                    id: 1,
                    title: 'Test Card 1',
                    description: 'Description du test card 1',
                    created_at: '2023-05-10T00:00:00.000Z',
                    tags: 'Test, React'
                },
                {
                    id: 2,
                    title: 'Test Card 2',
                    description: 'Description du test card 2',
                    created_at: '2023-06-15T00:00:00.000Z',
                    tags: 'TypeScript'
                }
            ]
            const response = transformData(rawData)

            expect(response).toEqual([
                {
                    id: 1,
                    title: 'Test Card 1',
                    description: 'Description du test card 1',

                    created_at: '2023-05-10T00:00:00.000Z',
                    tags: [
                        { id: 1, name: 'Test', color: 'bg-blue-500' },
                        { id: 2, name: 'React', color: 'bg-green-500' }
                    ]
                },
                {
                    id: 2,
                    title: 'Test Card 2',
                    description: 'Description du test card 2',
                    created_at: '2023-06-15T00:00:00.000Z',
                    tags: [{ id: 3, name: 'TypeScript', color: 'bg-blue-700' }]
                }
            ])
        })
    })
})
