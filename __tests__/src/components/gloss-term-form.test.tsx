import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import GlossTermsForm from '@/src/components/gloss-terms-form'

describe('Form tests', () => {
    it('renders a form', async () => {
        render(<GlossTermsForm />)
        expect(await screen.findByText('Ajouter un nouveau terme')).toBeDefined()
    })
})
