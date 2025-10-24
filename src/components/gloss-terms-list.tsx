import { GloseComplete } from '@/src/core/domain/models/Glose'
import CardGrid from '@/src/components/card-grid.tsx'

export default function GlossTermsList({ loading = false, glosesList = [], error = '' }: GlossTermsListProps) {
    const isCards = glosesList.length > 0
    return (
        <>
            <h3 className="py-4 text-lg">Gloses</h3>
            {loading && <div>{'Chargement des données en cours'}</div>}
            <p>{error}</p>
            <div>{isCards && <CardGrid cards={glosesList} />}</div>
        </>
    )
}

type GlossTermsListProps = {
    loading: boolean
    glosesList: GloseComplete[]
    error: string
}
