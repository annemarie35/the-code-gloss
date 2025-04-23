import GlossTermsForm from '@/src/components/gloss-terms-form'
import PageLayout from '@/src/pages/pageLayout'
import { useEffect, useState } from 'react'
import { getAllGlosesTerms } from '@/src/actions/gloses-actions'

import '../styles/globals.css'
import GlossTermsList from '@/src/components/gloss-terms-list'
import { GloseComplete } from '@/src/core/domain/models/Glose'

export default function Page() {
    const initialState: GloseComplete[] = []
    const [data, setData] = useState(initialState)
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
                <GlossTermsList loading={loading} glosesList={data} error={error} />
            </PageLayout>
        </div>
    )
}
