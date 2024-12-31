import GlossTermsForm from '@/src/components/gloss-terms-form'
import PageLayout from '@/src/pages/pageLayout'
import { Glose } from '@/src/lib/get-gloses'
import { httpClient } from '@/src/lib/http'
import { useEffect, useState } from 'react'

export default function Page() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchDataForPosts = async () => {
            try {
                const { gloses } = await httpClient({
                    url: 'http://localhost:3000/api/gloses',
                    requestConfig: {
                        method: 'GET',
                        headers: new Headers(),
                        mode: 'cors'
                    }
                })
                setData(gloses)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setError('Une erreur est survenue.')
            } finally {
                setLoading(false)
            }
        }

        fetchDataForPosts()
    }, [])
    return (
        <div>
            <PageLayout title="✨ Make your code base shine ✨">
                <GlossTermsForm />
                <h3 className="py-4 text-lg">Gloses</h3>
                {loading && <div>{'Chargement des données en cours'}</div>}
                {/*TODO Extract to a DisplayGlosesComponent*/}
                <div>{data && data.map((glose: Glose) => <p key={glose.id}>{glose.title}</p>)}</div>
                <p>{error}</p>
            </PageLayout>
        </div>
    )
}
