import { describe, it, expect, vi, beforeEach } from 'vitest'
import GlossTermsForm from '@/src/components/gloss-terms-form'
import { cleanup, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockFetchResponse, gloses } from '@/__tests__/test-helpers'

describe('Gloss Form Terms', () => {
    beforeEach(() => {
        const fetchResponse = createMockFetchResponse({ data: gloses, ok: true, status: 200 })
        global.fetch = vi.fn().mockResolvedValue(createMockFetchResponse(fetchResponse))
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

    describe('submit button', () => {
        it('should be disabled when all fields are empty', () => {
            const { getByRole } = render(<GlossTermsForm />)

            expect(getByRole('button', { name: /ajouter/i })).toBeDisabled()
        })

        it('should be disabled when only title is filled', async () => {
            const { getByRole } = render(<GlossTermsForm />)

            await userEvent.type(getByRole('textbox', { name: /title/i }), 'TDD')

            expect(getByRole('button', { name: /ajouter/i })).toBeDisabled()
        })

        it('should be disabled when only title and description are filled', async () => {
            const { getByRole } = render(<GlossTermsForm />)

            await userEvent.type(getByRole('textbox', { name: /title/i }), 'TDD')
            await userEvent.type(getByRole('textbox', { name: /description/i }), 'Created by Kent Beck')

            expect(getByRole('button', { name: /ajouter/i })).toBeDisabled()
        })

        it('should be enabled when all fields are filled', async () => {
            const { getByRole } = render(<GlossTermsForm />)

            await userEvent.type(getByRole('textbox', { name: /title/i }), 'TDD')
            await userEvent.type(getByRole('textbox', { name: /description/i }), 'Created by Kent Beck')
            await userEvent.type(getByRole('textbox', { name: /tags/i }), 'XP')

            expect(getByRole('button', { name: /ajouter/i })).toBeEnabled()
        })

        it('should be disabled again when a field is cleared after being filled', async () => {
            const { getByRole } = render(<GlossTermsForm />)
            const titleInput = getByRole('textbox', { name: /title/i })

            await userEvent.type(titleInput, 'TDD')
            await userEvent.type(getByRole('textbox', { name: /description/i }), 'Created by Kent Beck')
            await userEvent.type(getByRole('textbox', { name: /tags/i }), 'XP')
            await userEvent.clear(titleInput)

            expect(getByRole('button', { name: /ajouter/i })).toBeDisabled()
        })
    })

    describe('on submit', () => {
        it('should persist glose and display a success message on submit containing glose title', async () => {
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
                    mode: 'cors',
                    body: '{"title":"TDD","description":"Created by Kent Beck","tags":"XP"}'
                })
            )
        })
    })
})
