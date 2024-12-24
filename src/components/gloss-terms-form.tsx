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
            <h2>Ajouter un nouveau terme</h2>
            <form action={formAction} data-testid="gloss-terms-form">
                <input type="text" name="toto" placeholder="Event sourcing..." />
                <button type="submit" disabled={isPending}>
                    {' '}
                    {isPending ? 'Loading' : 'Ajouter'}
                </button>
                {error && <div> {error}</div>}
                {message && <div>{message}</div>}
            </form>
        </>
    )
}
