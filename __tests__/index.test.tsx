import { expect, it, describe, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import React from 'react'
import Page from '@/src/pages'

describe('Page', () => {
    global.fetch = vi.fn()

    function createFetchResponse(data: []) {
        return { json: () => new Promise((resolve) => resolve(data)) }
    }
    vi.mock('fetch', () => vi.fn().mockResolvedValue(createFetchResponse([])))

    render(<Page />)
    it('should contain a title', () => {
        expect(screen.getByRole('heading', { level: 2, name: '✨ Make your code base shine ✨' })).toBeDefined()
    })

    it('should contain a form', async () => {
        expect(screen.getAllByTestId('gloss-terms-form')).toBeDefined()
    })

    it('should contain a title for gloses section', () => {
        expect(screen.getByRole('heading', { level: 3, name: 'Gloses' })).toBeDefined()
    })
})
