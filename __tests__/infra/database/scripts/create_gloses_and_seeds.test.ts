import { describe, it, expect, vi, afterEach, beforeEach, MockedObject } from 'vitest'

import { createAndSeedDatabase } from '@/infra/database/scripts/create_gloses_and_seeds'
import { query } from '../../../../infra/database/connectionPool'
import { importJsonFile } from '@/infra/import_json_file.ts'

describe('CreateAndSeedDatabase', () => {
    describe('Main function', () => {
        vi.mock('pg')
        let importingFileFunctionMock: MockedObject<typeof importJsonFile>
        let queryMock: MockedObject<typeof query>

        beforeEach(() => {
            const seeds = [
                {
                    description: 'Invented by Alistair Cockburn in 2005',
                    tags: 'Craft',
                    title: 'Hexagonale architecture'
                },
                {
                    description: 'Invented by Eric Evans in 2003',
                    tags: 'Architecture',
                    title: 'DDD'
                }
            ]
            importingFileFunctionMock = vi.fn().mockReturnValue(seeds)
            queryMock = vi.fn().mockResolvedValue({ rowCount: 1 })
        })

        afterEach(() => {
            vi.resetAllMocks()
        })

        it('should import file', async () => {
            await createAndSeedDatabase({
                dataFilePath: 'path-to/file-to-import',
                importingFileFunction: importingFileFunctionMock,
                poolDb: queryMock
            })
            expect(importingFileFunctionMock).toBeCalledWith('path-to/file-to-import')
        })

        it('should log if something went wrong while importing file', async () => {
            vi.spyOn(console, 'error').mockImplementation(() => {})

            const fn = vi.fn().mockImplementationOnce(() => {
                throw new Error('some error')
            })
            await expect(
                createAndSeedDatabase({
                    dataFilePath: 'path-to/file-to-import',
                    importingFileFunction: fn,
                    poolDb: queryMock
                })
            ).rejects.toThrow('some error')
            expect(console.error).toHaveBeenCalledTimes(1)
            expect(console.error).toHaveBeenNthCalledWith(1, ' ❌ Error while importing file: some error')
        })

        describe('Insert entries', () => {
            it('should insert entries in database', async () => {
                const queryMock = vi.fn().mockResolvedValue({ rowCount: 3 })

                await createAndSeedDatabase({
                    dataFilePath: 'path-to/file-to-import',
                    importingFileFunction: importingFileFunctionMock,
                    poolDb: queryMock
                })

                expect(queryMock).toHaveBeenCalledTimes(2)
            })
        })
    })
})
