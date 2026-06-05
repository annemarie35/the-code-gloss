import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import PeoplePage from '@/src/pages/people'

describe('People', () => {
    beforeEach(() => {
        render(<PeoplePage />)
    })

    it('should render People page', () => {
        expect(screen.getByRole('heading', { level: 2, name: 'People' })).toBeDefined()
    })
})
