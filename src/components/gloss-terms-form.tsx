'use client'
import { useActionState } from 'react'

type InitialState = {
    message: string | null
    error: string | null
}

async function addGlossTerm() {
    return { message: 'Nouveau terme ajouté avec succès', error: null }
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
            <form action={formAction} data-testid="gloss-terms-form">
                <div className="flex flex-col gap-2 rounded-lg shadow-md p-4">
                    <div className="mx-2">
                        <label id="title" htmlFor="glose-title" aria-labelledby="title">
                            Title
                        </label>
                        <input type="text" name="glose-title" placeholder="Event sourcing..." />
                    </div>
                    <div className="mx-2">
                        <label htmlFor="glose-description">Description</label>
                        <input
                            type="text"
                            name="glose-description"
                            placeholder="The fundamental idea of Event Sourcing is that..."
                        />
                    </div>
                    <div className="mx-2">
                        <label htmlFor="glose-tags">Tags</label>
                        <input type="text" name="glose-tags" placeholder="DDD, code..." />
                    </div>
                    <div>
                        <button type="submit" disabled={isPending}>
                            {' '}
                            {isPending ? 'Loading' : 'Ajouter'}
                        </button>
                    </div>
                    <div>
                        {error && <div> {error}</div>}
                        {message && <div>{message}</div>}
                    </div>
                </div>
            </form>
        </>
    )
}
