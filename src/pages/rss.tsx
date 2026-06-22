import PageLayout from '@/src/pages/pageLayout'
import { useEffect, useState } from 'react'
import { getAllGlosesTerms } from '@/src/actions/gloses-actions'
import { GloseComplete } from '@/src/core/domain/models/Glose'

export default function RssPage() {
    const [gloses, setGloses] = useState<GloseComplete[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchGloses = async () => {
            const { gloses } = await getAllGlosesTerms()
            setGloses(gloses)
            setLoading(false)
        }
        fetchGloses()
    }, [])

    return (
        <div>
            <PageLayout title="Flux RSS">
                <div className="max-w-2xl">
                    <p className="text-gray-600 mb-4">
                        Abonnez-vous au flux RSS pour recevoir les derniers termes ajoutés.
                    </p>
                    <a
                        href="/api/rss"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-[#D53815] text-white px-4 py-2 rounded hover:opacity-90 mb-8"
                    >
                        S&apos;abonner au flux RSS
                    </a>

                    {loading ? (
                        <p className="text-gray-500">Chargement...</p>
                    ) : (
                        <ul className="space-y-4">
                            {gloses.map((glose) => (
                                <li key={glose.id} className="border-b border-gray-200 pb-4">
                                    <h2 className="font-semibold text-[#C4338E]">{glose.title}</h2>
                                    <p className="text-gray-700 text-sm mt-1">{glose.description}</p>
                                    <span className="text-xs text-gray-400">
                                        {new Date(glose.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </PageLayout>
        </div>
    )
}
