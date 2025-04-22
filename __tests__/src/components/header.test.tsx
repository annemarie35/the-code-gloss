import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '@/src/components/header'

describe('Header', () => {
    beforeEach(() => {
        render(<Header title="Some title" />)
    })

    it('renders an header with title', async () => {
        expect(screen.findByText('Some title')).toBeDefined()
    })

    it('contains a navbar', async () => {
        expect(screen.getByTestId('navbar')).toBeDefined()
    })
})
