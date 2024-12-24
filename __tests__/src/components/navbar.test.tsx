import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Navbar from '@/src/components/navbar'

describe('Navbar', () => {
    it('renders a navbar', async () => {
        render(<Navbar />)
        expect(await screen.findByText('Navbar')).toBeDefined()
    })
})
