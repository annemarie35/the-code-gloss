import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import PeoplePage from '@/src/pages/people'

vi.mock('@/src/actions/people-actions', () => ({
    getAllPeople: vi.fn().mockResolvedValue({ people: [], error: null, message: null })
}))

describe('People', () => {
    beforeEach(() => {
        render(<PeoplePage />)
    })

    it('should render People page', () => {
        expect(screen.getByRole('heading', { level: 2, name: 'People' })).toBeDefined()
    })

    it('should display a loading message while fetching people', () => {
        expect(screen.queryByText(/Chargement des données en cours/i)).toBeInTheDocument()
    })
})
