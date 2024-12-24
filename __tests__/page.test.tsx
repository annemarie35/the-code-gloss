import { expect, it, describe, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import React from 'react'
import Page from '@/app/page'

describe('Page', () => {
    render(<Page />)
    it('should contain a title', () => {
        expect(screen.getByRole('heading', { level: 1, name: 'The Code Gloss' })).toBeDefined()
    })

    it('should contain a form', async () => {
        expect(screen.getAllByTestId('gloss-terms-form')).toBeDefined()
    })

    it('Click the about router link', async () => {
        const user = userEvent.setup()
        const about = vi.spyOn(user, 'click')
        const aboutLink = screen.getByText(/About/i)

        await user.click(aboutLink)

        expect(about).toHaveBeenCalledTimes(1)
    })
})
