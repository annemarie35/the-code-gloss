import PageLayout from '@/src/pages/pageLayout'
import GlossTermsForm from '@/src/components/gloss-terms-form'

export default function Page() {
    return (
        <div>
            <PageLayout title="✨ Make your code base shine ✨">
                <GlossTermsForm />
                <h3 className="py-4 text-lg">Gloses</h3>
            </PageLayout>
        </div>
    )
}
