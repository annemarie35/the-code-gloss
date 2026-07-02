import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PeopleGrid, { transformPeople } from '@/src/components/people-grid'
import { Person } from '@/src/core/domain/Types/Person'

const mockPeople: Person[] = [
    {
        id: 1,
        first_name: 'Ada',
        last_name: 'Lovelace',
        nickname: 'ada_codes',
        blog_url: 'https://ada.dev',
        linkedin_url: 'https://linkedin.com/in/ada',
        biography: 'First programmer',
        year_of_birth: 1815,
        tags: 'pioneer, math',
        created_at: '2023-05-10T00:00:00.000Z'
    },
    {
        id: 2,
        first_name: 'Grace',
        last_name: 'Hopper',
        nickname: null,
        blog_url: null,
        linkedin_url: null,
        biography: 'Invented the compiler',
        year_of_birth: 1906,
        tags: 'compiler',
        created_at: '2023-06-15T00:00:00.000Z'
    }
]

describe('PeopleGrid Component', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    it('should render with default data when no props are provided', () => {
        render(<PeopleGrid />)
        expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
        expect(screen.getByText('First programmer')).toBeInTheDocument()
    })

    it('should render people from provided props', () => {
        render(<PeopleGrid people={mockPeople} />)

        expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
        expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
        expect(screen.getByText('First programmer')).toBeInTheDocument()
        expect(screen.getByText('Invented the compiler')).toBeInTheDocument()
    })

    it('should format dates correctly', () => {
        render(<PeopleGrid people={mockPeople} />)

        expect(screen.getByText(/10 mai 2023/)).toBeInTheDocument()
        expect(screen.getByText(/15 juin 2023/)).toBeInTheDocument()
    })

    it('should display tags for each person', () => {
        render(<PeopleGrid people={mockPeople} />)

        expect(screen.getByText('pioneer')).toBeInTheDocument()
        expect(screen.getByText('math')).toBeInTheDocument()
        expect(screen.getByText('compiler')).toBeInTheDocument()
    })

    it('should display nickname with @ prefix', () => {
        render(<PeopleGrid people={mockPeople} />)

        expect(screen.getByText('@ada_codes')).toBeInTheDocument()
    })

    it('should display blog and linkedin links', () => {
        render(<PeopleGrid people={mockPeople} />)

        expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', 'https://ada.dev')
        expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://linkedin.com/in/ada')
    })

    it('should not show delete buttons when onDelete is not provided', () => {
        render(<PeopleGrid people={mockPeople} />)

        expect(screen.queryByRole('button', { name: /Supprimer/i })).not.toBeInTheDocument()
    })

    it('should show a delete button per card when onDelete is provided', () => {
        const onDelete = vi.fn()
        render(<PeopleGrid people={mockPeople} onDelete={onDelete} />)

        const deleteButtons = screen.getAllByRole('button', { name: /Supprimer/i })
        expect(deleteButtons).toHaveLength(mockPeople.length)
    })

    it('should call onDelete with the person id when delete button is clicked', () => {
        const onDelete = vi.fn()
        render(<PeopleGrid people={mockPeople} onDelete={onDelete} />)

        fireEvent.click(screen.getByRole('button', { name: /Supprimer Ada Lovelace/i }))
        expect(onDelete).toHaveBeenCalledWith(1)
    })

    it('should apply responsive grid layout', () => {
        const { container } = render(<PeopleGrid people={mockPeople} />)

        const gridElement = container.querySelector('.grid')

        expect(gridElement).toHaveClass('grid')
        expect(gridElement).toHaveClass('grid-cols-1')
        expect(gridElement).toHaveClass('md:grid-cols-2')
        expect(gridElement).toHaveClass('lg:grid-cols-3')
    })

    describe('transformPeople', () => {
        it('should map people to PersonCard format', () => {
            const result = transformPeople(mockPeople)

            expect(result).toEqual([
                {
                    id: 1,
                    fullName: 'Ada Lovelace',
                    nickname: 'ada_codes',
                    biography: 'First programmer',
                    year_of_birth: 1815,
                    blog_url: 'https://ada.dev',
                    linkedin_url: 'https://linkedin.com/in/ada',
                    tags: ['pioneer', 'math'],
                    created_at: '2023-05-10T00:00:00.000Z'
                },
                {
                    id: 2,
                    fullName: 'Grace Hopper',
                    nickname: null,
                    biography: 'Invented the compiler',
                    year_of_birth: 1906,
                    blog_url: null,
                    linkedin_url: null,
                    tags: ['compiler'],
                    created_at: '2023-06-15T00:00:00.000Z'
                }
            ])
        })

        it('should handle person with no last_name', () => {
            const person: Person = {
                id: 3,
                first_name: 'Linus',
                last_name: null,
                nickname: null,
                blog_url: null,
                linkedin_url: null,
                biography: null,
                year_of_birth: null,
                tags: null,
                created_at: '2023-01-01T00:00:00.000Z'
            }
            const result = transformPeople([person])

            expect(result[0].fullName).toBe('Linus')
            expect(result[0].tags).toEqual([])
        })
    })
})
