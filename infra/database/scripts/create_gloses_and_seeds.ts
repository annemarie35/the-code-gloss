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
    importingFileFunction(dataFilePath: string): () => Seeds
}

type Seeds = Seed[]

type Seed = {
    description: string
    tags: string
    title: string
}
