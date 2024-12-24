import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Navbar from '@/src/components/navbar'
import userEvent from '@testing-library/user-event'

describe('Navbar', () => {
    it('Click the about router link', async () => {
        render(<Navbar />)

        const user = userEvent.setup()
        const about = vi.spyOn(user, 'click')
        const aboutLink = screen.getByText(/About/i)

        await user.click(aboutLink)

        expect(about).toHaveBeenCalledTimes(1)
    })
})
