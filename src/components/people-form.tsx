'use client'
import { useActionState, useState } from 'react'
import { addPerson } from '@/src/actions/people-actions'

export type InitialState = {
    message: string | null
    error: string | null
}

const initialState: InitialState = {
    message: '',
    error: ''
}

export default function PeopleForm() {
    const [state, formAction, isPending] = useActionState(addPerson, initialState)
    const { message, error } = state
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [tags, setTags] = useState('')

    const isFormValid = firstName.trim() !== '' && lastName.trim() !== '' && tags.trim() !== ''

    return (
        <>
            <h3 className="py-4 text-lg">Add a new person</h3>
            <form
                action={formAction}
                data-testid="people-form"
                className="flex flex-col py-2 rounded-lg shadow-md p-4 bg-red-100"
            >
                <div>
                    <label htmlFor="first-name" className="mr-4">
                        First name <span aria-hidden="true">*</span>
                    </label>
                    <input
                        type="text"
                        id="first-name"
                        name="first-name"
                        placeholder="Ada"
                        className="py-2 px-3 rounded-sm"
                        aria-label="first name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="last-name" className="mr-4">
                        Last name <span aria-hidden="true">*</span>
                    </label>
                    <input
                        type="text"
                        id="last-name"
                        name="last-name"
                        placeholder="Lovelace"
                        className="py-2 px-3 rounded-sm"
                        aria-label="last name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="nickname" className="mr-4">
                        Nickname
                    </label>
                    <input
                        type="text"
                        id="nickname"
                        name="nickname"
                        placeholder="ada_codes"
                        className="py-2 px-3 rounded-sm"
                        aria-label="nickname"
                    />
                </div>
                <div>
                    <label htmlFor="blog-url" className="mr-4">
                        Blog URL
                    </label>
                    <input
                        type="url"
                        id="blog-url"
                        name="blog-url"
                        placeholder="https://myblog.dev"
                        className="py-2 px-3 rounded-sm"
                        aria-label="blog url"
                    />
                </div>
                <div>
                    <label htmlFor="linkedin-url" className="mr-4">
                        LinkedIn URL
                    </label>
                    <input
                        type="url"
                        id="linkedin-url"
                        name="linkedin-url"
                        placeholder="https://linkedin.com/in/ada"
                        className="py-2 px-3 rounded-sm"
                        aria-label="linkedin url"
                    />
                </div>
                <div>
                    <label htmlFor="biography" className="mr-4">
                        Biography
                    </label>
                    <textarea
                        id="biography"
                        name="biography"
                        placeholder="A short biography..."
                        className="py-2 px-3 rounded-sm"
                        aria-label="biography"
                    />
                </div>
                <div>
                    <label htmlFor="year-of-birth" className="mr-4">
                        Year of birth
                    </label>
                    <input
                        type="number"
                        id="year-of-birth"
                        name="year-of-birth"
                        placeholder="1815"
                        className="py-2 px-3 rounded-sm"
                        aria-label="year of birth"
                    />
                </div>
                <div>
                    <label htmlFor="tags" className="mr-4">
                        Tags <span aria-hidden="true">*</span>
                    </label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        placeholder="pioneer, math..."
                        className="py-2 px-3 rounded-sm"
                        aria-label="tags"
                        required
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isPending || !isFormValid}
                        className="bg-[#C4338E] text-white mt-4 py-2 px-4 rounded content-end disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Loading' : 'Ajouter'}
                    </button>
                </div>
                <div>
                    {error && <p className="text-red-500">{error}</p>}
                    {message && <div>{message}</div>}
                </div>
            </form>
        </>
    )
}
