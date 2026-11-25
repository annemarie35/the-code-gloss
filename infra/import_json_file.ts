import path from 'path'
import fs from 'fs'
import type { GloseComplete } from '../src/core/domain/models/Glose.ts'
import type { Person } from '../src/core/domain/Types/Person.ts'

export const importJsonFile = (filePath: string): Seeds => {
    const dataFilePath = path.resolve(process.cwd(), filePath)

    console.log(`Search for the data file at: ${dataFilePath}`)

    if (!fs.existsSync(dataFilePath)) {
        throw new Error(`The data file does not exist at the location: ${dataFilePath}`)
    }

    const dataEntries = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'))

    if (!isSeeds(dataEntries)) {
        throw new Error('The JSON file must contain an object with "gloses" and "people" arrays')
    }

    console.log(
        `File with ${dataEntries.gloses.length} gloses and ${dataEntries.people.length} people successfully imported!`
    )
    return dataEntries
}

const isSeeds = (data: unknown): data is Seeds =>
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    Array.isArray((data as Seeds).gloses) &&
    Array.isArray((data as Seeds).people)

export type GloseSeed = Omit<GloseComplete, 'id' | 'created_at'>
export type PersonSeed = Omit<Person, 'id' | 'created_at'>
export type Seeds = { gloses: GloseSeed[]; people: PersonSeed[] }
