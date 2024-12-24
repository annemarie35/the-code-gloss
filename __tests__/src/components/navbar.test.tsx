import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Navbar from '@/src/components/navbar'

describe('Navbar', () => {
    const { getByRole } = render(<Navbar />)

    it('should have a link to about page', async () => {
        expect(getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    })

    it('should have a link to home page', async () => {
        expect(getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    })
})
