import PeopleForm from '@/src/components/people-form'
import PeopleList from '@/src/components/people-list'
import PageLayout from '@/src/pages/pageLayout'
import { useEffect, useState } from 'react'
import { getAllPeople, deletePerson } from '@/src/actions/people-actions'
import { Person } from '@/src/core/domain/Types/Person'

export default function PeoplePage() {
    const [data, setData] = useState<Person[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchPeople = async () => {
            const { people, error } = await getAllPeople()
            setLoading(false)
            if (error) {
                setError('Une erreur est survenue.')
            }
            setData(people)
        }
        fetchPeople()
    }, [])

    const handleDelete = async (id: number) => {
        await deletePerson(id)
        setData((prev) => prev.filter((p) => p.id !== id))
    }

    return (
        <div>
            <PageLayout title="People">
                <PeopleForm />
                <PeopleList loading={loading} peopleList={data} error={error} onDelete={handleDelete} />
            </PageLayout>
        </div>
    )
}
