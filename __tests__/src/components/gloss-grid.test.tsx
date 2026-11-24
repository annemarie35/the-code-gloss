import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import GlossGrid, { transformData } from '@/src/components/gloss-grid.tsx'
import { GloseComplete } from '@/src/core/domain/models/Glose.ts'

const mockGloses: GloseComplete[] = [
    {
        id: 1,
        title: 'Test Card 1',
        description: 'Description du test card 1',
        created_at: new Date('2023-05-10').toString(),
        tags: 'Test, React',
        themes: []
    },
    {
        id: 2,
        title: 'Test Card 2',
        description: 'Description du test card 2',
        created_at: new Date('2023-06-15').toString(),
        tags: 'TypeScript',
        themes: []
    }
]

describe('GlossGrid Component', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    it("devrait rendre le composant avec les données par défaut quand aucune prop n'est fournie", () => {
        render(<GlossGrid />)
        expect(screen.getByText('Hexagonale architecture')).toBeInTheDocument()

        expect(screen.getByText('Invented by Alistair Cockburn in 2005')).toBeInTheDocument()
        expect(screen.getByText('Craft')).toBeInTheDocument()
        expect(screen.getByText('Architecture')).toBeInTheDocument()
    })

    it('devrait colorer chaque tag selon sa couleur', () => {
        render(<GlossGrid cards={mockGloses} />)

        expect(screen.getByText('Test')).toHaveClass('bg-blue-500')
        expect(screen.getByText('TypeScript')).toHaveClass('bg-blue-700')
    })

    it('devrait rendre les gloses à partir des props fournies', () => {
        render(<GlossGrid cards={mockGloses} />)

        expect(screen.getByText('Test Card 1')).toBeInTheDocument()
        expect(screen.getByText('Test Card 2')).toBeInTheDocument()

        expect(screen.getByText('Description du test card 1')).toBeInTheDocument()
        expect(screen.getByText('Description du test card 2')).toBeInTheDocument()
    })

    it('devrait formater correctement les dates', () => {
        render(<GlossGrid cards={mockGloses} />)

        expect(screen.getByText(/10 mai 2023/)).toBeInTheDocument()
        expect(screen.getByText(/15 juin 2023/)).toBeInTheDocument()
    })

    it('devrait afficher les tags pour chaque glose', () => {
        render(<GlossGrid cards={mockGloses} />)

        expect(screen.getByText('Test')).toBeInTheDocument()
        expect(screen.getByText('React')).toBeInTheDocument()
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })

    it('devrait afficher le thème de la glose dans sa carte', () => {
        const gloseWithTheme: GloseComplete = { ...mockGloses[0], themes: ['DDD'] }

        render(<GlossGrid cards={[gloseWithTheme]} />)

        expect(screen.getByText('DDD')).toBeInTheDocument()
    })

    it('devrait afficher chaque thème comme une pastille non cliquable', () => {
        const gloseWithThemes: GloseComplete = { ...mockGloses[0], themes: ['DDD', 'CRAFT'] }

        render(<GlossGrid cards={[gloseWithThemes]} />)

        expect(screen.getByText('DDD')).toHaveClass('rounded-full')
        expect(screen.getByText('CRAFT')).toHaveClass('rounded-full')
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('devrait appliquer le bon layout de grid responsive', () => {
        const { container } = render(<GlossGrid cards={mockGloses} />)

        const gridElement = container.querySelector('.grid')

        expect(gridElement).toHaveClass('grid')
        expect(gridElement).toHaveClass('grid-cols-1')
        expect(gridElement).toHaveClass('md:grid-cols-2')
        expect(gridElement).toHaveClass('lg:grid-cols-3')
    })

    describe('transformData', () => {
        const colorOf = (tags: string) =>
            transformData([{ ...mockGloses[0], tags }])[0].tags.map((tag) => ({ name: tag.name, color: tag.color }))

        it.each([
            ['API', 'bg-red-500'],
            ['Architecture', 'bg-red-300'],
            ['Backend', 'bg-indigo-500'],
            ['CSS', 'bg-pink-500'],
            ['Craft', 'bg-red-200'],
            ['Frontend', 'bg-purple-500'],
            ['HTML', 'bg-orange-500'],
            ['JavaScript', 'bg-yellow-500'],
            ['Next.js', 'bg-black'],
            ['React', 'bg-green-500'],
            ['Routing', 'bg-violet-500'],
            ['Redux', 'bg-purple-700'],
            ['SSR', 'bg-teal-500'],
            ['Test', 'bg-blue-500'],
            ['TypeScript', 'bg-blue-700']
        ])('should color the %s tag with %s', (name, color) => {
            expect(colorOf(name)).toEqual([{ name, color }])
        })

        it('should use the default color for an unknown tag', () => {
            expect(colorOf('Elixir')).toEqual([{ name: 'Elixir', color: 'bg-gray-500' }])
        })

        it('should map gloses for better tags display', () => {
            const rawData = [
                {
                    id: 1,
                    title: 'Test Card 1',
                    description: 'Description du test card 1',
                    created_at: '2023-05-10T00:00:00.000Z',
                    tags: 'Test, React',
                    themes: []
                },
                {
                    id: 2,
                    title: 'Test Card 2',
                    description: 'Description du test card 2',
                    created_at: '2023-06-15T00:00:00.000Z',
                    tags: 'TypeScript',
                    themes: []
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
                    ],
                    themes: []
                },
                {
                    id: 2,
                    title: 'Test Card 2',
                    description: 'Description du test card 2',
                    created_at: '2023-06-15T00:00:00.000Z',
                    tags: [{ id: 3, name: 'TypeScript', color: 'bg-blue-700' }],
                    themes: []
                }
            ])
        })
    })
})
