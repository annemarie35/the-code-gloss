import { describe, it, expect, vi, beforeEach } from 'vitest'
import PeopleForm from '@/src/components/people-form'
import { cleanup, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockFetchResponse } from '@/__tests__/test-helpers'

describe('People Form', () => {
    beforeEach(() => {
        global.fetch = vi.fn().mockResolvedValue(createMockFetchResponse({ ok: true, status: 200 }))
        cleanup()
    })

    it('should display a title', () => {
        const { getByRole } = render(<PeopleForm />)

        expect(getByRole('heading', { name: /Add a new person/i })).toBeInTheDocument()
    })

    it('should display all fields', () => {
        const { getByLabelText } = render(<PeopleForm />)

        expect(getByLabelText(/first name/i)).toBeInTheDocument()
        expect(getByLabelText(/last name/i)).toBeInTheDocument()
        expect(getByLabelText(/nickname/i)).toBeInTheDocument()
        expect(getByLabelText(/blog url/i)).toBeInTheDocument()
        expect(getByLabelText(/linkedin url/i)).toBeInTheDocument()
        expect(getByLabelText(/biography/i)).toBeInTheDocument()
        expect(getByLabelText(/year of birth/i)).toBeInTheDocument()
        expect(getByLabelText(/tags/i)).toBeInTheDocument()
    })

    describe('submit button', () => {
        it('should be disabled when all required fields are empty', () => {
            const { getByRole } = render(<PeopleForm />)

            expect(getByRole('button', { name: /ajouter/i })).toBeDisabled()
        })

        it('should be disabled when only first name is filled', async () => {
            const { getByRole } = render(<PeopleForm />)

            await userEvent.type(getByRole('textbox', { name: /first name/i }), 'Ada')

            expect(getByRole('button', { name: /ajouter/i })).toBeDisabled()
        })

        it('should be disabled when only last name is filled', async () => {
            const { getByRole } = render(<PeopleForm />)

            await userEvent.type(getByRole('textbox', { name: /last name/i }), 'Lovelace')

            expect(getByRole('button', { name: /ajouter/i })).toBeDisabled()
        })

        it('should be disabled when only tags is filled', async () => {
            const { getByRole } = render(<PeopleForm />)

            await userEvent.type(getByRole('textbox', { name: /tags/i }), 'pioneer')

            expect(getByRole('button', { name: /ajouter/i })).toBeDisabled()
        })

        it('should be enabled when first name, last name and tags are filled', async () => {
            const { getByRole } = render(<PeopleForm />)

            await userEvent.type(getByRole('textbox', { name: /first name/i }), 'Ada')
            await userEvent.type(getByRole('textbox', { name: /last name/i }), 'Lovelace')
            await userEvent.type(getByRole('textbox', { name: /tags/i }), 'pioneer')

            expect(getByRole('button', { name: /ajouter/i })).toBeEnabled()
        })

        it('should be disabled again when first name is cleared', async () => {
            const { getByRole } = render(<PeopleForm />)
            const firstNameInput = getByRole('textbox', { name: /first name/i })

            await userEvent.type(firstNameInput, 'Ada')
            await userEvent.type(getByRole('textbox', { name: /last name/i }), 'Lovelace')
            await userEvent.type(getByRole('textbox', { name: /tags/i }), 'pioneer')
            await userEvent.clear(firstNameInput)

            expect(getByRole('button', { name: /ajouter/i })).toBeDisabled()
        })

        it('should be disabled again when last name is cleared', async () => {
            const { getByRole } = render(<PeopleForm />)
            const lastNameInput = getByRole('textbox', { name: /last name/i })

            await userEvent.type(getByRole('textbox', { name: /first name/i }), 'Ada')
            await userEvent.type(lastNameInput, 'Lovelace')
            await userEvent.type(getByRole('textbox', { name: /tags/i }), 'pioneer')
            await userEvent.clear(lastNameInput)

            expect(getByRole('button', { name: /ajouter/i })).toBeDisabled()
        })

        it('should be disabled again when tags is cleared', async () => {
            const { getByRole } = render(<PeopleForm />)
            const tagsInput = getByRole('textbox', { name: /tags/i })

            await userEvent.type(getByRole('textbox', { name: /first name/i }), 'Ada')
            await userEvent.type(getByRole('textbox', { name: /last name/i }), 'Lovelace')
            await userEvent.type(tagsInput, 'pioneer')
            await userEvent.clear(tagsInput)

            expect(getByRole('button', { name: /ajouter/i })).toBeDisabled()
        })
    })

    describe('on submit', () => {
        it('should persist person and display a success message containing the first name', async () => {
            const { getByRole, getByText } = render(<PeopleForm />)

            await userEvent.type(getByRole('textbox', { name: /first name/i }), 'Ada')
            await userEvent.type(getByRole('textbox', { name: /last name/i }), 'Lovelace')
            await userEvent.type(getByRole('textbox', { name: /tags/i }), 'pioneer')

            const user = userEvent.setup()
            await user.click(getByRole('button'))

            expect(getByText('Ada ajouté(e) avec succès')).toBeInTheDocument()

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/people',
                expect.objectContaining({
                    method: 'POST',
                    mode: 'cors'
                })
            )
        })

        it('should call onSuccess callback after successful submit', async () => {
            const onSuccess = vi.fn()
            const { getByRole } = render(<PeopleForm onSuccess={onSuccess} />)

            await userEvent.type(getByRole('textbox', { name: /first name/i }), 'Ada')
            await userEvent.type(getByRole('textbox', { name: /last name/i }), 'Lovelace')
            await userEvent.type(getByRole('textbox', { name: /tags/i }), 'pioneer')

            const user = userEvent.setup()
            await user.click(getByRole('button'))

            expect(onSuccess).toHaveBeenCalledOnce()
        })
    })
})
