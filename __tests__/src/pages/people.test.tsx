import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import PeoplePage from '@/src/pages/people'
import { getAllPeople, addPerson } from '@/src/actions/people-actions'

vi.mock('@/src/actions/people-actions', () => ({
    getAllPeople: vi.fn().mockResolvedValue({ people: [], error: null, message: null }),
    addPerson: vi.fn().mockResolvedValue({ message: null, error: null })
}))

describe('People', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        render(<PeoplePage />)
    })

    it('should render People page', () => {
        expect(screen.getByRole('heading', { level: 2, name: 'People' })).toBeDefined()
    })

    it('should display a loading message while fetching people', () => {
        expect(screen.queryByText(/Chargement des données en cours/i)).toBeInTheDocument()
    })

    it('should refetch people list after a person is successfully added', async () => {
        vi.mocked(addPerson).mockResolvedValueOnce({ message: 'Ada ajouté(e) avec succès', error: null })

        await userEvent.type(screen.getByRole('textbox', { name: /first name/i }), 'Ada')
        await userEvent.type(screen.getByRole('textbox', { name: /last name/i }), 'Lovelace')
        await userEvent.type(screen.getByRole('textbox', { name: /tags/i }), 'pioneer')
        await userEvent.click(screen.getByRole('button', { name: /ajouter/i }))

        await waitFor(() => {
            expect(getAllPeople).toHaveBeenCalledTimes(2)
        })
    })
})
