import { query } from '@/infra/database/connectionPool.ts'
import { INSERT_PERSON } from '@/infra/database/sql_queries.ts'
import { Person } from '@/src/core/domain/Types/Person.ts'

export const insertPerson = async (person: Omit<Person, 'id'>): Promise<void> => {
    await query(INSERT_PERSON('public'), [
        person.first_name,
        person.last_name,
        person.nickname,
        person.blog_url,
        person.linkedin_url,
        person.biography,
        person.year_of_birth,
        person.tags,
        person.created_at
    ])
}
