export async function createAndSeedDatabase({ dataFilePath, importingFileFunction }) {
    try {
        importingFileFunction(dataFilePath)
    } catch (error) {
        console.error(` ❌ Error while importing file: ${error.message}`)
        throw error
    }
}
