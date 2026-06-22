import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import RssPage from '@/src/pages/rss'

vi.mock('@/src/actions/gloses-actions', () => ({
    getAllGlosesTerms: vi.fn().mockResolvedValue({ gloses: [], error: null, message: null })
}))

describe('RSS page', () => {
    beforeEach(() => {
        render(<RssPage />)
    })

    it('should render the RSS page heading', () => {
        expect(screen.getByRole('heading', { level: 2, name: 'Flux RSS' })).toBeDefined()
    })

    it('should display a link to subscribe to the RSS feed', () => {
        const link = screen.getByRole('link', { name: "S'abonner au flux RSS" })
        expect(link).toBeDefined()
        expect(link.getAttribute('href')).toBe('/api/rss')
    })
})
