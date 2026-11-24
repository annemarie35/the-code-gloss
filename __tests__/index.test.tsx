import { expect, it, describe, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import React from 'react'

import { createMockFetchResponse, gloses } from '@/__tests__/test-helpers'
import Page from '@/src/pages/index'
import { GloseComplete } from '@/src/core/domain/models/Glose'

const glosesWithThemes: GloseComplete[] = [
    { ...gloses[0], id: 1, title: 'Hexagonale architecture', themes: ['CRAFT'] },
    { ...gloses[0], id: 2, title: 'Bounded context', themes: ['DDD'] }
]

function mockFetchGloses(data: GloseComplete[]) {
    const fetchResponse = createMockFetchResponse({ data, ok: true, status: 200 })
    global.fetch = vi.fn().mockResolvedValue(createMockFetchResponse(fetchResponse))
}

describe('Page', () => {
    describe('Render properly', () => {
        beforeEach(() => {
            mockFetchGloses(gloses)
            render(<Page />)
        })

        it('should contain a title', () => {
            expect(
                screen.getByRole('heading', { level: 2, name: '✨ Make your code knowledge shine ✨' })
            ).toBeDefined()
        })

        it('should contain a form', async () => {
            expect(screen.getAllByTestId('gloss-terms-form')).toBeDefined()
        })

        it('should contain a glose', async () => {
            expect(await screen.findByText(/Hexagonale architecture/i)).toBeInTheDocument()
        })

        it('should display a loading message until gloses are loaded', async () => {
            expect(screen.getByText(/Chargement des données en cours/i)).toBeInTheDocument()

            await waitFor(() => expect(screen.queryByText(/Chargement des données en cours/i)).not.toBeInTheDocument())
        })

        it('should not display an error message when gloses are loaded', async () => {
            await screen.findByText(/Hexagonale architecture/i)

            expect(screen.queryByText('Une erreur est survenue.')).not.toBeInTheDocument()
        })
    })

    describe('Render with errors retrieving gloses', () => {
        beforeEach(() => {
            global.fetch = vi.fn().mockRejectedValue(new Error('network down'))
            render(<Page />)
        })

        it('should display an error message', async () => {
            expect(await screen.findByText('Une erreur est survenue.')).toBeInTheDocument()
            expect(screen.queryByText(/Chargement des données en cours/i)).not.toBeInTheDocument()
        })
    })

    describe('Filter by theme', () => {
        beforeEach(async () => {
            mockFetchGloses(glosesWithThemes)
            render(<Page />)
            await screen.findByText('Bounded context')
        })

        it('should only display gloses of the selected theme', async () => {
            await userEvent.click(screen.getByRole('button', { name: 'DDD' }))

            expect(screen.getByText('Bounded context')).toBeInTheDocument()
            expect(screen.queryByText('Hexagonale architecture')).not.toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'DDD' })).toHaveAttribute('aria-pressed', 'true')
        })

        it('should display all gloses again when the theme is unselected', async () => {
            await userEvent.click(screen.getByRole('button', { name: 'DDD' }))
            await userEvent.click(screen.getByRole('button', { name: 'DDD' }))

            expect(screen.getByText('Bounded context')).toBeInTheDocument()
            expect(screen.getByText('Hexagonale architecture')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'DDD' })).toHaveAttribute('aria-pressed', 'false')
        })

        it('should keep both themes selected when two are toggled', async () => {
            await userEvent.click(screen.getByRole('button', { name: 'DDD' }))
            await userEvent.click(screen.getByRole('button', { name: 'CRAFT' }))

            expect(screen.getByText('Bounded context')).toBeInTheDocument()
            expect(screen.getByText('Hexagonale architecture')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'DDD' })).toHaveAttribute('aria-pressed', 'true')
            expect(screen.getByRole('button', { name: 'CRAFT' })).toHaveAttribute('aria-pressed', 'true')
        })

        it('should keep the other selected themes when one theme is unselected', async () => {
            await userEvent.click(screen.getByRole('button', { name: 'DDD' }))
            await userEvent.click(screen.getByRole('button', { name: 'CRAFT' }))
            await userEvent.click(screen.getByRole('button', { name: 'DDD' }))

            expect(screen.getByText('Hexagonale architecture')).toBeInTheDocument()
            expect(screen.queryByText('Bounded context')).not.toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'CRAFT' })).toHaveAttribute('aria-pressed', 'true')
            expect(screen.getByRole('button', { name: 'DDD' })).toHaveAttribute('aria-pressed', 'false')
        })
    })
})
