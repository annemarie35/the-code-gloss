import { importJsonFile } from '../../../infra/import_json_file.ts'
import type { Seeds } from '../../../infra/import_json_file.ts'
import { query } from '../../../infra/database/connectionPool.ts'
import type { PgPoolQuery } from '../../../infra/database/connectionPool.ts'
import { INSERT_GLOSE } from '../../../infra/database/sql_queries.ts'

export async function createAndSeedDatabase({
    dataFilePath,
    importingFileFunction,
    poolDb
}: createAndSeedDatabaseDependencies) {
    try {
        const gloses = importingFileFunction(dataFilePath)
        const created_at = new Date().toISOString()
        gloses.forEach(async (glose) => {
            await poolDb(INSERT_GLOSE('public'), [glose.description, glose.title, glose.tags, created_at])
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'unknown error'
        console.error(` ❌ Error while importing file: ${message}`)
        throw error
    }
}

type createAndSeedDatabaseDependencies = {
    dataFilePath: string
    importingFileFunction: (dataFilePath: string) => Seeds
    poolDb: PgPoolQuery
}

await createAndSeedDatabase({
    dataFilePath: 'infra/database/scripts/seeds.json',
    importingFileFunction: importJsonFile,
    poolDb: query
})
