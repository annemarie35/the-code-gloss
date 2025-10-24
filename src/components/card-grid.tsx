import { GloseComplete } from '@/src/core/domain/models/Glose.ts'
import { formatDate } from '@/src/helpers/date-formatter.ts'

type Tag = {
    id: number
    name: string
    color: string
}

export type Card = {
    id: number
    title: string
    description: string
    created_at: Date
    tags: Tag[]
}

type CardGridProps = {
    cards?: GloseComplete[]
}

const defaultCardsData: GloseComplete[] = [
    {
        id: 1,
        title: 'Hexagonale architecture',
        description: 'Invented by Alistair Cockburn in 2005',
        created_at: '2023-05-10T00:00:00.000Z',
        tags: 'Craft, Architecture'
    }
]

const tagColorMap: Record<string, string> = {
    API: 'bg-red-500',
    Architecture: 'bg-red-300',
    Backend: 'bg-indigo-500',
    CSS: 'bg-pink-500',
    Craft: 'bg-red-200',
    default: 'bg-gray-500',
    Frontend: 'bg-purple-500',
    HTML: 'bg-orange-500',
    JavaScript: 'bg-yellow-500',
    'Next.js': 'bg-black',
    React: 'bg-green-500',
    Routing: 'bg-violet-500',
    Redux: 'bg-purple-700',
    SSR: 'bg-teal-500',
    Test: 'bg-blue-500',
    TypeScript: 'bg-blue-700'
}

export const transformData = (gloses: GloseComplete[]) => {
    let nextTagId = 1

    return gloses.map((rawGlose) => {
        const tagNames = rawGlose.tags.split(',').map((tag) => tag.trim())

        const tags: Tag[] = tagNames.map((tagName) => {
            const color = tagColorMap[tagName] || tagColorMap.default
            return {
                id: nextTagId++,
                name: tagName,
                color
            }
        })

        return {
            id: rawGlose.id,
            title: rawGlose.title,
            description: rawGlose.description,
            created_at: rawGlose.created_at,
            tags
        }
    })
}

export default function CardGrid({ cards = defaultCardsData }: CardGridProps) {
    const transformedCards = transformData(cards)
    //console.log(JSON.stringify(transformedCards, null, 2))

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Gloses Terms</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transformedCards.map((card) => (
                    <div
                        key={card.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">{card.title}</h2>
                            <p className="text-gray-600 mb-4">{card.description}</p>

                            <div className="text-sm text-gray-500 mb-4 ">
                                <span className="inline-block">
                                    <span className="font-medium">Créé le:</span> {formatDate(card.created_at)}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {card.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className={`${tag.color} text-white text-xs px-2 py-1 rounded-full`}
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
