'use server'
import { InitialState } from '@/src/components/gloss-terms-form'
import { httpClient } from '@/src/lib/http'
import { Glose } from '@/src/lib/database/get-gloses'

export async function addGlossTerm(previousState: InitialState, formData: FormData): Promise<InitialState> {
    const customHeaders = new Headers()
    customHeaders.append('Accept', 'application/json')

    try {
        await httpClient({
            url: 'http://localhost:3000/api/gloses',
            requestConfig: {
                method: 'POST',
                headers: customHeaders,
                mode: 'cors',
                body: JSON.stringify({
                    title: formData.get('glose-title') as string,
                    description: formData.get('glose-description') as string,
                    tags: formData.get('glose-tags') as string
                })
            }
        })
        return { message: `Nouveau terme ${formData.get('glose-title') as string} ajouté avec succès`, error: null }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        return { message: null, error: 'Une erreur est survenue' }
    }
}

export async function getAllGlosesTerms(): Promise<Gloses> {
    try {
        const { gloses } = await httpClient({
            url: 'http://localhost:3000/api/gloses',
            requestConfig: {
                method: 'GET',
                headers: new Headers(),
                mode: 'cors'
            }
        })
        return { message: null, error: null, gloses }
    } catch (err) {
        console.log('error in getAllGlosesTerms', err)
        return { message: null, error: 'Une erreur est survenue', gloses: [] }
    }
}

type Gloses = {
    message: null | string
    gloses: Glose[]
    error: null | string
}
