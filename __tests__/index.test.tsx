import { expect, it, describe, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

import React from 'react'

import { createMockFetchResponse, gloses } from '@/__tests__/helpers'
import Page from '@/src/pages/_app'

describe('Page', () => {
    describe('Render properly', () => {
        beforeEach(() => {
            const fetchResponse = createMockFetchResponse({ data: gloses, ok: true, status: 200 })
            global.fetch = vi.fn().mockResolvedValue(createMockFetchResponse(fetchResponse))
            render(<Page />)
        })

        it('should contain a title', () => {
            expect(screen.getByRole('heading', { level: 2, name: '✨ Make your code base shine ✨' })).toBeDefined()
        })

        it('should contain a form', async () => {
            expect(screen.getAllByTestId('gloss-terms-form')).toBeDefined()
        })

        it('should contain a title for gloses section', () => {
            expect(screen.getByRole('heading', { level: 3, name: 'Gloses' })).toBeDefined()
        })

        it('should contain a glose', async () => {
            expect(await screen.findByText(/Hexagonale architecture/i)).toBeInTheDocument()
        })
    })

    describe('Render with errors retrieving gloses', () => {
        beforeEach(() => {
            render(<Page />)
            const errorFetchResponse = createMockFetchResponse({ ok: false, status: 500 })
            global.fetch = vi.fn().mockRejectedValue(createMockFetchResponse(errorFetchResponse))
        })

        it('should display an error message', () => {
            expect(screen.getByText(/Chargement des données en cours/i)).toBeInTheDocument()
        })
    })
})
