import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '@/src/components/header'

describe('Header', () => {
    it('renders an header with title', async () => {
        render(<Header title="Some title" />)
        expect(await screen.findByText('Some title')).toBeDefined()
    })
})
