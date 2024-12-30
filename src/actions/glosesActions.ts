'use server'
import { InitialState } from '@/src/components/gloss-terms-form'
import { revalidatePath } from 'next/cache'

export async function addGlossTerm(previousState: InitialState, formData: FormData): Promise<InitialState> {
    const customHeaders = new Headers()
    customHeaders.append('Accept', 'application/json')
    //const requestConfig = { method: 'POST', headers: customHeaders, mode: 'cors', cache: 'default' }
    try {
        // do something
        const response = await fetch('http://localhost:3000/api/gloses', {
            method: 'POST',
            headers: customHeaders,
            mode: 'cors',
            body: JSON.stringify({
                title: formData.get('title') as string,
                description: formData.get('descriptions') as string,
                tags: formData.get('tags') as string
            })
        })

        if (response.ok) {
            return { message: 'Nouveau terme ajouté avec succès', error: null }
        } else {
            return { message: null, error: 'Une erreur est survenue' }
        }
    } catch (error) {
        console.error(error)
        // return 'an error occured'
        return { message: null, error: 'Une erreur est survenue' }
    }
    revalidatePath('/')
}
