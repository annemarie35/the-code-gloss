import fs from 'fs'
import path from 'path'

export const importFile = (filePath) => {
    const dataFilePath = path.resolve(process.cwd(), filePath)

    console.log(`Search for the data file at: ${dataFilePath}`)

    if (!fs.existsSync(dataFilePath)) {
        throw new Error(`The data file does not exist at the location: ${dataFilePath}`)
    }

    const dataEntries = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'))

    if (!Array.isArray(dataEntries)) {
        throw new Error('The JSON file must contain an array of entries')
    }

    console.log(`Start database update with ${dataEntries.length} entries...`)
    return dataEntries
}

export async function createAndSeedDatabase({ dataFilePath, importingFileFunction }) {
    try {
        importingFileFunction(dataFilePath)
    } catch (error) {
        console.error(` ❌ Error while importing file: ${error.message}`)
        throw error
    }
}
