import GlossTermsForm from '@/src/components/gloss-terms-form'
import PageLayout from '@/src/pages/pageLayout'
import { Glose } from '@/src/lib/get-gloses'
import { useEffect, useState } from 'react'
import { getAllGlosesTerms } from '@/src/actions/glosesActions'

export default function Page() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchDataForPosts = async () => {
            const { gloses, error } = await getAllGlosesTerms()
            setLoading(false)
            if (error) {
                setError('Une erreur est survenue.')
            }
            setData(gloses)
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
