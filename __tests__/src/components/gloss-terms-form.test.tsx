import { describe, it, expect, afterEach } from 'vitest'
import GlossTermsForm from '@/src/components/gloss-terms-form'
import { cleanup, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Gloss Form Terms', () => {
    afterEach(() => {
        cleanup()
        // TODO Maybe move to setup files, prevents from render in each it section that causes the component to be renders a lot of times, then the `getMultipleElementsFoundError` appears
    })

    it('should display a title', () => {
        const { getByRole } = render(<GlossTermsForm />)
        expect(
            getByRole('heading', {
                name: /Ajouter un nouveau terme/i
            })
        ).toBeInTheDocument()
    })

    it('should display a add title input', () => {
        const { getByLabelText } = render(<GlossTermsForm />)

        expect(getByLabelText('Title')).toBeInTheDocument()
    })

    it('should display a success message on submit', async () => {
        const { getByRole, getByText } = render(<GlossTermsForm />)
        const submitButton = getByRole('button')

        const user = userEvent.setup()
        await user.click(submitButton)
        expect(getByText('Nouveau terme ajouté avec succès')).toBeInTheDocument()
    })
})
