import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Paragraph } from '@/src/components/ui/paragraph'

describe('Paragraph', () => {
    it('renders a paragraph', async () => {
        const { queryByText } = render(<Paragraph text="some text" />)
        expect(queryByText('some text')).toBeTruthy()
    })
})
