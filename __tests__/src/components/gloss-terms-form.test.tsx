import { describe, it, expect, vi, beforeEach } from 'vitest'
import GlossTermsForm from '@/src/components/gloss-terms-form'
import { cleanup, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Gloss Form Terms', () => {
    beforeEach(() => {
        cleanup()
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

    describe('on submit', () => {
        it('should persist glose and display a success message on submit containing glose title', async () => {
            global.fetch = vi.fn()

            vi.mock('fetch', () => vi.fn().mockResolvedValueOnce('toto'))
            const { getByRole, getByText } = render(<GlossTermsForm />)
            const gloseTitleInput = getByRole('textbox', { name: /title/i })
            const gloseDescriptionInput = getByRole('textbox', { name: /description/i })
            const gloseTagsInput = getByRole('textbox', { name: /tags/i })

            await userEvent.type(gloseTitleInput, 'TDD')
            await userEvent.type(gloseDescriptionInput, 'Created by Kent Beck')
            await userEvent.type(gloseTagsInput, 'XP')

            const submitButton = getByRole('button')

            const user = userEvent.setup()
            await user.click(submitButton)

            expect(getByText('Nouveau terme TDD ajouté avec succès')).toBeInTheDocument()

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/gloses',
                expect.objectContaining({
                    method: 'POST',
                    headers: new Headers(),
                    mode: 'cors',
                    body: '{"title":"TDD","description":"Created by Kent Beck","tags":"XP"}'
                    // toMatchObject issue
                })
            )
        })
    })
})
