import { Person } from '@/src/core/domain/Types/Person'
import PeopleGrid from '@/src/components/people-grid'

export default function PeopleList({ loading = false, peopleList = [], error = '' }: PeopleListProps) {
    const hasPeople = peopleList.length > 0
    return (
        <>
            {loading && <div>{'Chargement des données en cours'}</div>}
            <p>{error}</p>
            <div>{hasPeople && <PeopleGrid people={peopleList} />}</div>
        </>
    )
}

type PeopleListProps = {
    loading: boolean
    peopleList: Person[]
    error: string
}
