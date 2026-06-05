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
        it('should be disabled when first name is empty', () => {
            const { getByRole } = render(<PeopleForm />)

            expect(getByRole('button', { name: /ajouter/i })).toBeDisabled()
        })

        it('should be enabled when first name is filled', async () => {
            const { getByRole } = render(<PeopleForm />)

            await userEvent.type(getByRole('textbox', { name: /first name/i }), 'Ada')

            expect(getByRole('button', { name: /ajouter/i })).toBeEnabled()
        })

        it('should be disabled again when first name is cleared', async () => {
            const { getByRole } = render(<PeopleForm />)
            const firstNameInput = getByRole('textbox', { name: /first name/i })

            await userEvent.type(firstNameInput, 'Ada')
            await userEvent.clear(firstNameInput)

            expect(getByRole('button', { name: /ajouter/i })).toBeDisabled()
        })
    })

    describe('on submit', () => {
        it('should persist person and display a success message containing the first name', async () => {
            const { getByRole, getByText } = render(<PeopleForm />)

            await userEvent.type(getByRole('textbox', { name: /first name/i }), 'Ada')

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
    })
})
