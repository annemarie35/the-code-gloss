import { GloseComplete } from '@/src/core/domain/models/Glose'

export default function GlossTermsList({ loading = false, glosesList = [], error = '' }: GlossTermsListProps) {
    return (
        <>
            <h3 className="py-4 text-lg">Gloses</h3>
            {loading && <div>{'Chargement des données en cours'}</div>}
            <div>{glosesList && glosesList.map((glose: GloseComplete) => <p key={glose.id}>{glose.title}</p>)}</div>
            <p>{error}</p>
        </>
    )
}

type GlossTermsListProps = {
    loading: boolean
    glosesList: GloseComplete[]
    error: string
}
