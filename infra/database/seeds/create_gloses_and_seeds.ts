import { importJsonFile } from '../../import_json_file.ts'
import type { Seeds } from '../../import_json_file.ts'
import { pgConnectionPool, query } from '../connectionPool.ts'
import type { PgPoolQuery } from '../connectionPool.ts'
import INSERT_GLOSE, { INSERT_PERSON } from '../sql_queries.ts'

export async function createAndSeedDatabase({
    dataFilePath,
    importingFileFunction,
    poolDb,
    closePool
}: CreateAndSeedDatabaseDependencies): Promise<void> {
    try {
        const { gloses, people }: Seeds = importingFileFunction(dataFilePath)
        const created_at: string = new Date().toISOString()
        for (const glose of gloses) {
            await poolDb(INSERT_GLOSE('public'), [glose.description, glose.title, glose.tags, created_at, glose.themes])
        }
        for (const person of people) {
            await poolDb(INSERT_PERSON('public'), [
                person.first_name,
                person.last_name,
                person.nickname,
                person.blog_url,
                person.linkedin_url,
                person.biography,
                person.year_of_birth,
                person.tags,
                created_at
            ])
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'unknown error'
        console.error(` ❌ Error while importing file: ${message}`)
        throw error
    } finally {
        await closePool()
    }
}

type CreateAndSeedDatabaseDependencies = {
    dataFilePath: string
    importingFileFunction: (dataFilePath: string) => Seeds
    poolDb: PgPoolQuery
    closePool: () => Promise<void>
}

await createAndSeedDatabase({
    dataFilePath: 'infra/database/seeds/seeds.json',
    importingFileFunction: importJsonFile,
    poolDb: query,
    closePool: () => pgConnectionPool.end()
})
