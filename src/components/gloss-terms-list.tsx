import { GloseComplete } from '@/src/core/domain/models/Glose'
import GlossGrid from '@/src/components/gloss-grid.tsx'

export default function GlossTermsList({ loading = false, glosesList = [], error = '' }: GlossTermsListProps) {
    const isCards = glosesList.length > 0
    return (
        <>
            {loading && <div>{'Chargement des données en cours'}</div>}
            <p>{error}</p>
            <div>{isCards && <GlossGrid cards={glosesList} />}</div>
        </>
    )
}

type GlossTermsListProps = {
    loading: boolean
    glosesList: GloseComplete[]
    error: string
}
