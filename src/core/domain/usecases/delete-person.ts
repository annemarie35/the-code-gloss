import { deletePerson as defaultDeletePerson } from '@/infra/repositories/person_repository.ts'

export const deletePerson = async (id: number, deletePersonFn: (id: number) => Promise<void> = defaultDeletePerson) => {
    await deletePersonFn(id)
    return 'succes'
}
