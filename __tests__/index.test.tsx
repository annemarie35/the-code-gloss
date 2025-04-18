import { expect, it, describe, vi } from 'vitest'
import { render } from '@testing-library/react'

import React from 'react'

import { createFetchResponse, gloses } from '@/__tests__/helpers'
import Page from '@/src/pages/_app'

describe('Page', () => {
    describe('Render properly', () => {
        const fetchResponse = createFetchResponse({ data: gloses, ok: true, status: 200 })
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse(fetchResponse))

        const { getByRole, getAllByTestId, getByText } = render(<Page />)

        it('should contain a title', () => {
            expect(getByRole('heading', { level: 2, name: '✨ Make your code base shine ✨' })).toBeDefined()
        })

        it('should contain a form', async () => {
            expect(getAllByTestId('gloss-terms-form')).toBeDefined()
        })

        it('should contain a title for gloses section', () => {
            expect(getByRole('heading', { level: 3, name: 'Gloses' })).toBeDefined()
        })

        it('should contain a glose', async () => {
            expect(getByText(/Hexagonale architecture/i)).toBeInTheDocument()
        })
    })

    describe('Render with errors retrieving gloses', () => {
        const errorFetchResponse = createFetchResponse({ ok: false, status: 500 })
        global.fetch = vi.fn().mockRejectedValue(createFetchResponse(errorFetchResponse))

        it('should display an error message', () => {
            const { getByText } = render(<Page />)
            expect(getByText(/Chargement des données en cours/i)).toBeInTheDocument()
            expect(getByText(/Une erreur est survenue./i)).toBeInTheDocument()
        })
    })
})
