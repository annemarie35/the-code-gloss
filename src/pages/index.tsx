import GlossTermsForm from '@/src/components/gloss-terms-form'
import PageLayout from '@/src/pages/pageLayout'
import { Glose } from '@/src/lib/get-gloses'

const response: Response = await fetch('http://localhost:3000/api/gloses')
const { gloses } = await response.json()

export default function Page() {
    return (
        <div>
            <PageLayout title="✨ Make your code base shine ✨">
                <GlossTermsForm />
                <h3 className="py-4 text-lg">Gloses</h3>
                <div>
                    {gloses.map((glose: Glose) => (
                        <p key={glose.id}>{glose.title}</p>
                    ))}
                </div>
            </PageLayout>
        </div>
    )
}
