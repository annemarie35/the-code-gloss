import PageLayout from '@/src/pages/pageLayout'
import { useEffect, useRef, useState } from 'react'
import { getFeed } from '@/src/actions/feeds-actions'
import { Feed, FeedItem } from '@/src/core/domain/models/Feed'

type LoadedFeed = Feed & { url: string }

const STORAGE_KEY = 'rss-feed-urls'

export default function FeedsPage() {
    const [feedUrls, setFeedUrls] = useState<string[]>([])
    const [feeds, setFeeds] = useState<LoadedFeed[]>([])
    const [error, setError] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            const urls: string[] = JSON.parse(saved)
            setFeedUrls(urls)
            urls.forEach((url) => loadFeed(url))
        }
    }, [])

    async function loadFeed(url: string) {
        const { feed, error } = await getFeed(url)

        if (error || !feed) {
            setError(`Impossible de charger : ${url}`)
            return
        }
        setFeeds((prev) => {
            if (prev.some((f) => f.url === url)) return prev
            return [...prev, { ...feed, url }]
        })
    }

    function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        const url = inputRef.current?.value.trim()
        if (!url) return
        if (feedUrls.includes(url)) return
        const updated = [...feedUrls, url]
        setFeedUrls(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        loadFeed(url)
        if (inputRef.current) inputRef.current.value = ''
    }

    function handleRemove(url: string) {
        const updated = feedUrls.filter((u) => u !== url)
        setFeedUrls(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        setFeeds((prev) => prev.filter((f) => f.url !== url))
    }

    const allItems: (FeedItem & { feedTitle: string })[] = feeds.flatMap((feed) =>
        feed.items.map((item) => ({ ...item, feedTitle: feed.title }))
    )

    return (
        <div>
            <PageLayout title="Flux RSS importes">
                <form onSubmit={handleAdd} className="flex gap-2 mb-6 max-w-xl">
                    <input
                        ref={inputRef}
                        type="url"
                        placeholder="https://example.com/feed.xml"
                        required
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C4338E]"
                    />
                    <button
                        type="submit"
                        className="bg-[#D53815] text-white px-4 py-2 rounded text-sm hover:opacity-90"
                    >
                        Ajouter
                    </button>
                </form>

                {feedUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {feedUrls.map((url) => (
                            <span
                                key={url}
                                className="flex items-center gap-1 bg-[#FFECF5] text-[#C4338E] text-xs px-3 py-1 rounded-full"
                            >
                                {url}
                                <button
                                    onClick={() => handleRemove(url)}
                                    className="ml-1 text-[#C4338E] hover:text-[#D53815] font-bold"
                                    aria-label={`Supprimer ${url}`}
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                {allItems.length === 0 && feedUrls.length > 0 && (
                    <p className="text-gray-400 text-sm">Chargement des articles...</p>
                )}

                {allItems.length === 0 && feedUrls.length === 0 && (
                    <p className="text-gray-400 text-sm">Ajoutez une URL de flux RSS pour afficher les articles.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allItems.map((item, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col gap-2">
                            <span className="text-xs text-[#C4338E] font-medium">{item.feedTitle}</span>
                            <h2 className="font-semibold text-gray-800 text-sm leading-snug">{item.title}</h2>
                            {item.description && (
                                <p className="text-gray-500 text-xs line-clamp-3">{item.description}</p>
                            )}
                            <div className="mt-auto flex items-center justify-between pt-2">
                                {item.pubDate && (
                                    <span className="text-xs text-gray-400">
                                        {new Date(item.pubDate).toLocaleDateString('fr-FR')}
                                    </span>
                                )}
                                {item.link && (
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-[#D53815] hover:underline"
                                    >
                                        Lire &rarr;
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </PageLayout>
        </div>
    )
}
