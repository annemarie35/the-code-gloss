import { importJsonFile } from '../../import_json_file.ts'
import type { Seeds } from '../../import_json_file.ts'
import { query } from '../connectionPool.ts'
import type { PgPoolQuery } from '../connectionPool.ts'
import { INSERT_GLOSE } from '../sql_queries.ts'

export async function createAndSeedDatabase({
    dataFilePath,
    importingFileFunction,
    poolDb
}: CreateAndSeedDatabaseDependencies): Promise<void> {
    try {
        const gloses: Seeds = importingFileFunction(dataFilePath)
        const created_at: string = new Date().toISOString()
        gloses.forEach(async (glose: Seeds[number]) => {
            await poolDb(INSERT_GLOSE('public'), [glose.description, glose.title, glose.tags, created_at])
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'unknown error'
        console.error(` ❌ Error while importing file: ${message}`)
        throw error
    }
}

type CreateAndSeedDatabaseDependencies = {
    dataFilePath: string
    importingFileFunction: (dataFilePath: string) => Seeds
    poolDb: PgPoolQuery
}

await createAndSeedDatabase({
    dataFilePath: 'infra/database/seeds/seeds.json',
    importingFileFunction: importJsonFile,
    poolDb: query
})
