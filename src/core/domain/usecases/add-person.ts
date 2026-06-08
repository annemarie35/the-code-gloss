import { insertPerson as defaultInsertPerson } from '@/infra/repositories/person_repository.ts'
import { Person } from '@/src/core/domain/Types/Person.ts'

export const addPerson = async (
    person: Omit<Person, 'id' | 'created_at'>,
    insertPerson: (person: Omit<Person, 'id'>) => Promise<void> = defaultInsertPerson
) => {
    await insertPerson({ ...person, created_at: new Date().toISOString() })
    return 'succes'
}
