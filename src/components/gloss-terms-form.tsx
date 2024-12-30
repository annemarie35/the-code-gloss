'use client'
import { useActionState } from 'react'
import { addGlossTerm } from '@/src/actions/glosesActions'

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
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-[#C4338E] text-white mt-4 py-2 px-4 rounded content-end"
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
