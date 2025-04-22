import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Navbar from '@/src/components/navbar'

describe('Navbar', () => {
    beforeEach(() => {
        render(<Navbar />)
    })

    it('should have a link to about page', async () => {
        expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    })

    it('should have a link to home page', async () => {
        expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    })
})
