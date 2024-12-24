import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Navbar from '@/src/components/navbar'

describe('Navbar', () => {
    it('should have a link to about page', async () => {
        const { getByRole } = render(<Navbar />)
        expect(getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    })
})
