import path from 'path'
import fs from 'fs'

export const importJsonFile = (filePath: string): Seeds => {
    const dataFilePath = path.resolve(process.cwd(), filePath)

    console.log(`Search for the data file at: ${dataFilePath}`)

    if (!fs.existsSync(dataFilePath)) {
        throw new Error(`The data file does not exist at the location: ${dataFilePath}`)
    }

    const dataEntries = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'))

    if (!Array.isArray(dataEntries)) {
        throw new Error('The JSON file must contain an array of entries')
    }

    console.log(`File with ${dataEntries.length} entries successfully imported!`)
    return dataEntries
}

export type Seeds = Seed[]

type Seed = {
    description: string
    tags: string
    title: string
}
