import { Person } from '@/src/core/domain/Types/Person'
import { formatDate } from '@/src/helpers/date-formatter'

type PersonCard = {
    id: number
    fullName: string
    nickname: string | null
    biography: string | null
    year_of_birth: number | null
    blog_url: string | null
    linkedin_url: string | null
    tags: string[]
    created_at: string
}

const defaultPeopleData: Person[] = [
    {
        id: 1,
        first_name: 'Ada',
        last_name: 'Lovelace',
        nickname: 'ada_codes',
        blog_url: null,
        linkedin_url: null,
        biography: 'First programmer',
        year_of_birth: 1815,
        tags: 'pioneer, math',
        created_at: '2023-05-10T00:00:00.000Z'
    }
]

type PeopleGridProps = {
    people?: Person[]
}

export const transformPeople = (people: Person[]): PersonCard[] => {
    return people.map((person) => ({
        id: person.id,
        fullName: `${person.first_name}${person.last_name ? ` ${person.last_name}` : ''}`,
        nickname: person.nickname,
        biography: person.biography,
        year_of_birth: person.year_of_birth,
        blog_url: person.blog_url,
        linkedin_url: person.linkedin_url,
        tags: person.tags ? person.tags.split(',').map((tag) => tag.trim()) : [],
        created_at: person.created_at
    }))
}

export default function PeopleGrid({ people = defaultPeopleData }: PeopleGridProps) {
    const transformedPeople = transformPeople(people)

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">People</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transformedPeople.map((person) => (
                    <div
                        key={person.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">{person.fullName}</h2>
                            {person.nickname && <p className="text-sm text-gray-500 mb-2">@{person.nickname}</p>}
                            {person.biography && <p className="text-gray-600 mb-4">{person.biography}</p>}
                            {person.year_of_birth && (
                                <p className="text-sm text-gray-500 mb-2">{person.year_of_birth}</p>
                            )}

                            <div className="text-sm text-gray-500 mb-4">
                                <span className="inline-block">
                                    <span className="font-medium">Ajouté le:</span> {formatDate(person.created_at)}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {person.tags.map((tag, index) => (
                                    <span key={index} className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                {person.blog_url && (
                                    <a
                                        href={person.blog_url}
                                        className="text-blue-500 text-sm hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Blog
                                    </a>
                                )}
                                {person.linkedin_url && (
                                    <a
                                        href={person.linkedin_url}
                                        className="text-blue-700 text-sm hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        LinkedIn
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
