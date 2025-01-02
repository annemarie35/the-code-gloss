import { expect, it, describe, vi } from 'vitest'
import { render } from '@testing-library/react'

import React from 'react'
import Page from '@/src/pages'

import { createFetchResponse } from '@/__tests__/helpers'
import { Glose } from '@/src/lib/get-gloses'

describe('Page', () => {
    const gloses: Glose[] = [
        {
            created_at: 'date',
            description: 'Invented by Alistair Cockburn in 2005',
            id: 8,
            tags: 'Craft, Architecture',
            title: 'Hexagonale architecture'
        }
    ]

    describe('Render properly', () => {
        const toto = createFetchResponse({ data: gloses, ok: true, status: 200 })
        global.fetch = vi.fn().mockResolvedValue(createFetchResponse(toto))

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
})
