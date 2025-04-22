import { Glose } from '@/src/lib/database/get-gloses-db-query'

export default function GlossTermsList({ loading = false, glosesList = [], error = '' }: GlossTermsListProps) {
    console.log({
        loading,
        glosesList,
        error
    })

    return (
        <>
            <h3 className="py-4 text-lg">Gloses</h3>
            {loading && <div>{'Chargement des données en cours'}</div>}
            <div>{glosesList && glosesList.map((glose: Glose) => <p key={glose.id}>{glose.title}</p>)}</div>
            <p>{error}</p>
        </>
    )
}

type GlossTermsListProps = {
    loading: boolean
    glosesList: Glose[]
    error: string
}
