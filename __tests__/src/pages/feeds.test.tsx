import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import FeedsPage from '@/src/pages/feeds'

vi.mock('@/src/actions/feeds-actions', () => ({
    getFeed: vi.fn().mockResolvedValue({ feed: null, error: null })
}))

describe('Feeds page', () => {
    beforeEach(() => {
        render(<FeedsPage />)
    })

    it('should render the Feeds page heading', () => {
        expect(screen.getByRole('heading', { level: 2, name: 'Flux RSS importes' })).toBeDefined()
    })

    it('should display the feed URL input', () => {
        expect(screen.getByPlaceholderText('https://example.com/feed.xml')).toBeDefined()
    })

    it('should display the add button', () => {
        expect(screen.getByRole('button', { name: 'Ajouter' })).toBeDefined()
    })

    it('should display an empty state message when no feeds are added', () => {
        expect(screen.getByText('Ajoutez une URL de flux RSS pour afficher les articles.')).toBeDefined()
    })
})
