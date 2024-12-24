import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Header from '@/src/components/header'

describe('Header', () => {
    const { findByText, getByTestId } = render(<Header title="Some title" />)

    it('renders an header with title', async () => {
        expect(findByText('Some title')).toBeDefined()
    })

    it('contains a navbar', async () => {
        expect(getByTestId('navbar')).toBeDefined()
    })
})
