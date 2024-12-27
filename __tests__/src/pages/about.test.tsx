import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import About from '@/src/pages/about'

describe('About', () => {
    it('should render About page', () => {
        render(<About />)
        expect(screen.getByRole('heading', { level: 2, name: 'À propos' })).toBeDefined()
    })

    it('should contain 6 paragraphs', async () => {
        expect(screen.getAllByTestId('paragraph').length).toBe(6)
    })
})
