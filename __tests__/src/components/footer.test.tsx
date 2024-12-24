import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Footer from '@/src/components/footer'

describe('Footer', () => {
    it('renders a footer', async () => {
        const { queryByText } = render(<Footer />)
        expect(queryByText('Made with love @2024')).toBeTruthy()
    })
})
