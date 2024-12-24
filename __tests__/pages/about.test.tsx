import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import About from '@/pages/about'

describe('About', () => {
    it('should render About page', () => {
        render(<About />)
        expect(screen.getByRole('heading', { level: 1, name: 'À propos' })).toBeDefined()
    })
})
