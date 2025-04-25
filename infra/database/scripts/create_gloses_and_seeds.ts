import { importJsonFile } from '../../../infra/import_json_file.ts'
import type { Seeds } from '../../../infra/import_json_file.ts'

export async function createAndSeedDatabase({
    dataFilePath,
    importingFileFunction
}: createAndSeedDatabaseDependencies) {
    try {
        importingFileFunction(dataFilePath)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'unknown error'
        console.error(` ❌ Error while importing file: ${message}`)
        throw error
    }
}

type createAndSeedDatabaseDependencies = {
    dataFilePath: string
    importingFileFunction: (dataFilePath: string) => Seeds
}

await createAndSeedDatabase({
    dataFilePath: 'infra/database/scripts/seeds.json',
    importingFileFunction: importJsonFile
})
