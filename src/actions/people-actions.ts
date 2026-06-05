'use server'
import { InitialState } from '@/src/components/people-form'
import { httpClient } from '@/src/lib/http'

export async function addPerson(previousState: InitialState, formData: FormData): Promise<InitialState> {
    const customHeaders = new Headers()
    customHeaders.append('Accept', 'application/json')

    try {
        await httpClient({
            url: 'http://localhost:3000/api/people',
            requestConfig: {
                method: 'POST',
                headers: customHeaders,
                mode: 'cors',
                body: JSON.stringify({
                    first_name: formData.get('first-name') as string,
                    last_name: formData.get('last-name') as string,
                    nickname: formData.get('nickname') as string,
                    blog_url: formData.get('blog-url') as string,
                    linkedin_url: formData.get('linkedin-url') as string,
                    biography: formData.get('biography') as string,
                    year_of_birth: formData.get('year-of-birth') as string,
                    tags: formData.get('tags') as string
                })
            }
        })
        return { message: `${formData.get('first-name') as string} ajouté(e) avec succès`, error: null }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        return { message: null, error: "Une erreur est survenue dans l'ajout d'une personne" }
    }
}
