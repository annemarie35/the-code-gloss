import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Footer from '@/src/components/footer'

describe('Footer', () => {
    it('renders a footer', async () => {
        const { getByRole } = render(<Footer />)
        expect(getByRole('link')).toHaveAttribute('href', '/about')
    })
})
