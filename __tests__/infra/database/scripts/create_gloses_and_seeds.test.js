import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'

import { createAndSeedDatabase, importFile } from '../../../../infra/database/scripts/create_gloses_and_seeds.js'

describe('CreateAndSeedDatabase', () => {
    describe('importFile with data to seed db with', () => {
        vi.mock('fs')
        vi.mock('path')

        beforeEach(() => {
            vi.resetAllMocks()
            vi.spyOn(process, 'cwd').mockReturnValue('/fake/cwd')
            vi.spyOn(console, 'log').mockImplementation(() => {})
            vi.spyOn(console, 'error').mockImplementation(() => {})
        })

        afterEach(() => {
            vi.restoreAllMocks()
        })

        const testData = [
            { id: 1, name: 'Test 1' },
            { id: 2, name: 'Test 2' }
        ]

        path.resolve.mockReturnValue('/fake/path/data.json')
        fs.existsSync.mockReturnValue(true)
        fs.readFileSync.mockReturnValue(JSON.stringify(testData))

        it('read and return json file properly', () => {
            // Données de test
            const testData = [
                { id: 1, name: 'Test 1' },
                { id: 2, name: 'Test 2' }
            ]

            path.resolve.mockReturnValue('/fake/path/data.json')
            fs.existsSync.mockReturnValue(true)
            fs.readFileSync.mockReturnValue(JSON.stringify(testData))

            const result = importFile('data.json')

            // Vérifications
            expect(path.resolve).toHaveBeenCalledWith('/fake/cwd', 'data.json')
            expect(fs.existsSync).toHaveBeenCalledWith('/fake/path/data.json')
            expect(fs.readFileSync).toHaveBeenCalledWith('/fake/path/data.json', 'utf8')
            expect(result).toEqual(testData)
            expect(console.log).toHaveBeenCalledTimes(2)
            expect(console.log).toHaveBeenNthCalledWith(1, 'Search for the data file at: /fake/path/data.json')
            expect(console.log).toHaveBeenNthCalledWith(2, 'Start database update with 2 entries...')
        })

        it('throws error if file with seeds is missing', () => {
            path.resolve.mockReturnValue('/fake/path/missing.json')
            fs.existsSync.mockReturnValue(false)

            expect(() => importFile('missing.json')).toThrow(
                'The data file does not exist at the location: /fake/path/missing.json'
            )
        })

        it('throws error if file data is not an array', () => {
            const testData = { key: 'value' }

            path.resolve.mockReturnValue('/fake/path/invalid.json')
            fs.existsSync.mockReturnValue(true)
            fs.readFileSync.mockReturnValue(JSON.stringify(testData))

            expect(() => importFile('invalid.json')).toThrow('The JSON file must contain an array of entries')
        })
    })

    describe('Main function', () => {
        let importingFileFunctionSpy = vi.fn()
        beforeEach(() => {
            vi.resetAllMocks()
            vi.spyOn(console, 'error').mockImplementation(() => {})
        })
        it('should import file', async () => {
            await createAndSeedDatabase({
                dataFilePath: 'path-to/file-to-import',
                importingFileFunction: importingFileFunctionSpy
            })
            expect(importingFileFunctionSpy).toBeCalledWith('path-to/file-to-import')
        })

        it('should log if someting went wrong while importing file', async () => {
            const fn = vi.fn().mockImplementationOnce(() => {
                throw new Error('some error')
            })
            await expect(
                createAndSeedDatabase({
                    dataFilePath: 'path-to/file-to-import',
                    importingFileFunction: fn
                })
            ).rejects.toThrow('some error')
            expect(console.error).toHaveBeenCalledTimes(1)
            expect(console.error).toHaveBeenNthCalledWith(1, ' ❌ Error while importing file: some error')
        })
    })
})
