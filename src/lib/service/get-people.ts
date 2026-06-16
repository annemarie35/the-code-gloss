'use server'

import { selectAllPeople } from '@/infra/repositories/person_repository'
import { Person } from '@/src/core/domain/Types/Person'
import type { QueryResultRow } from 'pg'

export async function getPeopleInMemory(): Promise<Person[]> {
    const dataDB = await selectAllPeople()
    return mapToPeople(dataDB)
}

const mapToPeople = (dataDB: QueryResultRow[]): Person[] => {
    return dataDB.map((data) => data as Person)
}
