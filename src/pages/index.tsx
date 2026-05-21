import GlossTermsForm from '@/src/components/gloss-terms-form'
import PageLayout from '@/src/pages/pageLayout'
import { useEffect, useState } from 'react'
import { getAllGlosesTerms } from '@/src/actions/gloses-actions'
import GlossTermsList from '@/src/components/gloss-terms-list'
import ThemeFilter from '@/src/components/theme-filter'
import { filterByThemes } from '@/src/lib/filter-by-themes'
import { GloseComplete, Theme } from '@/src/core/domain/models/Glose'

export default function Page() {
    const initialState: GloseComplete[] = []
    const [data, setData] = useState(initialState)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedThemes, setSelectedThemes] = useState<Theme[]>([])

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

    const handleToggleTheme = (theme: Theme) => {
        setSelectedThemes((prev) => (prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]))
    }

    const filteredGloses = filterByThemes(data, selectedThemes)

    return (
        <div>
            <PageLayout title="✨ Make your code knowledge shine ✨">
                <GlossTermsForm />
                <ThemeFilter selectedThemes={selectedThemes} onToggle={handleToggleTheme} />
                <GlossTermsList loading={loading} glosesList={filteredGloses} error={error} />
            </PageLayout>
        </div>
    )
}
