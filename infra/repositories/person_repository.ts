import { query } from '@/infra/database/connectionPool.ts'
import { INSERT_PERSON, SELECT_ALL_PEOPLE, DELETE_PERSON } from '@/infra/database/sql_queries.ts'
import { Person } from '@/src/core/domain/Types/Person.ts'
import type { QueryResultRow } from 'pg'

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

export const selectAllPeople = async (): Promise<QueryResultRow[]> => {
    const { rows } = await query(SELECT_ALL_PEOPLE('public'), [])
    return rows
}

export const deletePerson = async (id: number): Promise<void> => {
    await query(DELETE_PERSON('public'), [id])
}
