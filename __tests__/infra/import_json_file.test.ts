import { describe, it, expect, beforeEach, afterEach, vi, MockedObject } from 'vitest'
import fs from 'fs'
import path from 'path'
import { importJsonFile } from '@/infra/import_json_file'

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

    const mockedPath = path as MockedObject<typeof path>
    const mockedFs = fs as MockedObject<typeof fs>

    it('read and return json file properly', () => {
        const testData = [
            { id: 1, name: 'Test 1' },
            { id: 2, name: 'Test 2' }
        ]
        mockedPath.resolve.mockReturnValue('/fake/path/data.json')
        mockedFs.existsSync.mockReturnValue(true)
        mockedFs.readFileSync.mockReturnValue(JSON.stringify(testData))

        const result = importJsonFile('data.json')

        expect(path.resolve).toHaveBeenCalledWith('/fake/cwd', 'data.json')
        expect(fs.existsSync).toHaveBeenCalledWith('/fake/path/data.json')
        expect(fs.readFileSync).toHaveBeenCalledWith('/fake/path/data.json', 'utf8')

        expect(result).toEqual(testData)

        expect(console.log).toHaveBeenCalledTimes(2)
        expect(console.log).toHaveBeenNthCalledWith(1, 'Search for the data file at: /fake/path/data.json')
        expect(console.log).toHaveBeenNthCalledWith(2, 'Start database update with 2 entries...')
    })

    it('throws error if file with seeds is missing', () => {
        mockedPath.resolve.mockReturnValue('/fake/path/missing.json')
        mockedFs.existsSync.mockReturnValue(false)

        expect(() => importJsonFile('missing.json')).toThrow(
            'The data file does not exist at the location: /fake/path/missing.json'
        )
    })

    it('throws error if file data is not an array', () => {
        const testData = { key: 'value' }
        mockedPath.resolve.mockReturnValue('/fake/path/invalid.json')
        mockedFs.existsSync.mockReturnValue(true)
        mockedFs.readFileSync.mockReturnValue(JSON.stringify(testData))

        expect(() => importJsonFile('invalid.json')).toThrow('The JSON file must contain an array of entries')
    })
})
