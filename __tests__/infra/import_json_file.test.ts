import { describe, it, expect, beforeEach, afterEach, vi, MockedObject } from 'vitest'
import fs from 'fs'
import path from 'path'
import { importJsonFile } from '@/infra/import_json_file'

vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn(),
        readFileSync: vi.fn()
    },
    existsSync: vi.fn(),
    readFileSync: vi.fn()
}))
vi.mock('path', () => ({
    default: {
        resolve: vi.fn()
    },
    resolve: vi.fn()
}))

describe('importFile with data to seed db with', () => {
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
        const testData = {
            gloses: [
                { title: 'DDD', description: 'Invented by Eric Evans in 2003', tags: 'Architecture', themes: ['DDD'] },
                { title: 'SOLID', description: 'Robert C. Martin', tags: 'Design', themes: ['DESIGN'] }
            ],
            people: [{ first_name: 'Eric', last_name: 'Evans' }]
        }
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
        expect(console.log).toHaveBeenNthCalledWith(2, 'File with 2 gloses and 1 people successfully imported!')
    })

    it('throws error if file with seeds is missing', () => {
        mockedPath.resolve.mockReturnValue('/fake/path/missing.json')
        mockedFs.existsSync.mockReturnValue(false)

        expect(() => importJsonFile('missing.json')).toThrow(
            'The data file does not exist at the location: /fake/path/missing.json'
        )
    })

    it.each([
        ['an array', [{ title: 'DDD' }]],
        ['an object without gloses', { people: [] }],
        ['an object without people', { gloses: [] }],
        ['an object with gloses not being an array', { gloses: {}, people: [] }],
        ['an object with people not being an array', { gloses: [], people: 'nope' }],
        ['null', null]
    ])('throws error if file data is %s', (_label, testData) => {
        mockedPath.resolve.mockReturnValue('/fake/path/invalid.json')
        mockedFs.existsSync.mockReturnValue(true)
        mockedFs.readFileSync.mockReturnValue(JSON.stringify(testData))

        expect(() => importJsonFile('invalid.json')).toThrow(
            'The JSON file must contain an object with "gloses" and "people" arrays'
        )
    })
})
