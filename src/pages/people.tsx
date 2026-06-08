import PeopleForm from '@/src/components/people-form'
import PageLayout from '@/src/pages/pageLayout'

export default function PeoplePage() {
    return (
        <div>
            <PageLayout title="People">
                <PeopleForm />
            </PageLayout>
        </div>
    )
}
