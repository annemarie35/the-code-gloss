import { describe, it, expect, vi, beforeEach } from 'vitest'
import GlossTermsForm from '@/src/components/gloss-terms-form'
import { cleanup, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockFetchResponse, gloses } from '@/__tests__/test-helpers'
import { THEMES } from '@/src/core/domain/models/Glose'

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
                name: /Add a new gloss/i
            })
        ).toBeInTheDocument()
    })

    it('should display a add title input', () => {
        const { getByLabelText } = render(<GlossTermsForm />)

        expect(getByLabelText('Title')).toBeInTheDocument()
    })

    describe('theme select', () => {
        it('should display a theme select with all available themes', () => {
            const { getByRole, getAllByRole } = render(<GlossTermsForm />)

            const select = getByRole('combobox', { name: /theme/i })
            expect(select).toBeInTheDocument()

            const options = getAllByRole('option')
            const themeOptions = options.filter((o) => o.getAttribute('value') !== '')
            expect(themeOptions).toHaveLength(THEMES.length)
            THEMES.forEach((theme) => {
                expect(select).toHaveTextContent(theme)
            })
        })

        it('should allow selecting a theme', async () => {
            const { getByRole } = render(<GlossTermsForm />)

            const select = getByRole('combobox', { name: /theme/i })
            await userEvent.selectOptions(select, 'CRAFT')

            expect(select).toHaveValue('CRAFT')
        })
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
            await userEvent.selectOptions(getByRole('combobox', { name: /theme/i }), 'CRAFT')

            expect(getByRole('button', { name: /ajouter/i })).toBeEnabled()
        })

        it('should be disabled again when a field is cleared after being filled', async () => {
            const { getByRole } = render(<GlossTermsForm />)
            const titleInput = getByRole('textbox', { name: /title/i })

            await userEvent.type(titleInput, 'TDD')
            await userEvent.type(getByRole('textbox', { name: /description/i }), 'Created by Kent Beck')
            await userEvent.type(getByRole('textbox', { name: /tags/i }), 'XP')
            await userEvent.selectOptions(getByRole('combobox', { name: /theme/i }), 'CRAFT')
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
            await userEvent.selectOptions(getByRole('combobox', { name: /theme/i }), 'CRAFT')

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
