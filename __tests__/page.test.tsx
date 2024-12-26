import { expect, it, describe } from 'vitest'
import { render, screen } from '@testing-library/react'

import React from 'react'
import Page from '@/app/page'

describe('Page', () => {
    render(<Page />)
    it('should contain a title', () => {
        expect(screen.getByRole('heading', { level: 2, name: '✨ Make your code base shine ✨' })).toBeDefined()
    })

    it('should contain a form', async () => {
        expect(screen.getAllByTestId('gloss-terms-form')).toBeDefined()
    })
})
