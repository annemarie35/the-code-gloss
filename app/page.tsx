import PageLayout from '@/src/pages/pageLayout'
import GlossTermsForm from '@/src/components/gloss-terms-form'

export default function Page() {
    return (
        <div>
            <PageLayout title="The Code Gloss">
                <GlossTermsForm />
            </PageLayout>
        </div>
    )
}
