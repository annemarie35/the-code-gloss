'use client'
import { useActionState, useState } from 'react'
import { addGlossTerm } from '@/src/actions/gloses-actions'

export type InitialState = {
    message: string | null
    error: string | null
}

const initialState: InitialState = {
    message: '',
    error: ''
}

export default function GlossTermsForm() {
    const [state, formAction, isPending] = useActionState(addGlossTerm, initialState)
    const { message, error } = state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState('')

    const isFormValid = title.trim() !== '' && description.trim() !== '' && tags.trim() !== ''

    return (
        <>
            <h3 className="py-4 text-lg">Ajouter un nouveau terme</h3>
            <form
                action={formAction}
                data-testid="gloss-terms-form"
                className="flex flex-col py-2 rounded-lg shadow-md p-4 bg-red-100"
            >
                <div>
                    <label id="title" htmlFor="glose-title" aria-labelledby="title" className="mr-4">
                        Title
                    </label>
                    <input
                        type="text"
                        name="glose-title"
                        placeholder="Event sourcing..."
                        className="py-2 px-3 rounded-sm"
                        aria-label="title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="glose-description" aria-labelledby="description" className="mr-4">
                        Description
                    </label>
                    <input
                        type="text"
                        name="glose-description"
                        placeholder="The fundamental idea of Event Sourcing is that..."
                        className="py-2 px-3 rounded-sm"
                        aria-label="description"
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="glose-tags" aria-labelledby="tags" className="mr-4">
                        Tags
                    </label>
                    <input
                        type="text"
                        name="glose-tags"
                        placeholder="DDD, code..."
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
                        {' '}
                        {isPending ? 'Loading' : 'Ajouter'}
                    </button>
                </div>
                <div>
                    {error && <p className="text-red-500"> {error}</p>}
                    {message && <div>{message}</div>}
                </div>
            </form>
        </>
    )
}
