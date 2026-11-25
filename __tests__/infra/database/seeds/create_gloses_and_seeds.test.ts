import { describe, it, expect, vi, afterEach, beforeEach, Mock, MockedObject } from 'vitest'

import { createAndSeedDatabase } from '@/infra/database/seeds/create_gloses_and_seeds.ts'
import { query } from '@/infra/database/connectionPool.ts'
import { importJsonFile } from '@/infra/import_json_file.ts'
import INSERT_GLOSE, { INSERT_PERSON } from '@/infra/database/sql_queries.ts'

vi.mock('pg')

describe('CreateAndSeedDatabase', () => {
    describe('Main function', () => {
        let importingFileFunctionMock: MockedObject<typeof importJsonFile>
        let queryMock: Mock<typeof query>
        let closePoolMock: Mock<() => Promise<void>>

        beforeEach(() => {
            const seeds = {
                gloses: [
                    {
                        description: 'Invented by Alistair Cockburn in 2005',
                        tags: 'Craft',
                        title: 'Hexagonale architecture',
                        themes: ['CRAFT']
                    },
                    {
                        description: 'Invented by Eric Evans in 2003',
                        tags: 'Architecture',
                        title: 'DDD'
                    }
                ],
                people: [
                    {
                        first_name: 'Alistair',
                        last_name: 'Cockburn',
                        nickname: null,
                        blog_url: 'https://alistair.cockburn.us',
                        linkedin_url: null,
                        biography: 'Inventor of the hexagonal architecture',
                        year_of_birth: 1953,
                        tags: 'Craft, Architecture'
                    }
                ]
            }
            importingFileFunctionMock = vi.fn().mockReturnValue(seeds)
            queryMock = vi.fn().mockResolvedValue({ rowCount: 1 })
            closePoolMock = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
        })

        afterEach(() => {
            vi.resetAllMocks()
        })

        it('should import file', async () => {
            await createAndSeedDatabase({
                dataFilePath: 'path-to/file-to-import',
                importingFileFunction: importingFileFunctionMock,
                poolDb: queryMock,
                closePool: closePoolMock
            })
            expect(importingFileFunctionMock).toHaveBeenCalledWith('path-to/file-to-import')
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
                    poolDb: queryMock,
                    closePool: closePoolMock
                })
            ).rejects.toThrow('some error')
            expect(console.error).toHaveBeenCalledTimes(1)
            expect(console.error).toHaveBeenNthCalledWith(1, ' ❌ Error while importing file: some error')
        })

        it('should log and rethrow if an insertion fails', async () => {
            vi.spyOn(console, 'error').mockImplementation(() => {})
            const failingQueryMock = vi.fn().mockRejectedValue(new Error('insert failed'))

            await expect(
                createAndSeedDatabase({
                    dataFilePath: 'path-to/file-to-import',
                    importingFileFunction: importingFileFunctionMock,
                    poolDb: failingQueryMock,
                    closePool: closePoolMock
                })
            ).rejects.toThrow('insert failed')
            expect(console.error).toHaveBeenCalledWith(' ❌ Error while importing file: insert failed')
        })

        describe('Close connection pool', () => {
            it('should close the pool once after all insertions', async () => {
                await createAndSeedDatabase({
                    dataFilePath: 'path-to/file-to-import',
                    importingFileFunction: importingFileFunctionMock,
                    poolDb: queryMock,
                    closePool: closePoolMock
                })

                expect(closePoolMock).toHaveBeenCalledTimes(1)
                expect(closePoolMock.mock.invocationCallOrder[0]).toBeGreaterThan(
                    Math.max(...queryMock.mock.invocationCallOrder)
                )
            })

            it('should close the pool even if an insertion fails', async () => {
                vi.spyOn(console, 'error').mockImplementation(() => {})
                const failingQueryMock = vi.fn().mockRejectedValue(new Error('insert failed'))

                await expect(
                    createAndSeedDatabase({
                        dataFilePath: 'path-to/file-to-import',
                        importingFileFunction: importingFileFunctionMock,
                        poolDb: failingQueryMock,
                        closePool: closePoolMock
                    })
                ).rejects.toThrow('insert failed')
                expect(closePoolMock).toHaveBeenCalledTimes(1)
            })

            it('should close the pool even if the file import fails', async () => {
                vi.spyOn(console, 'error').mockImplementation(() => {})
                const failingImport = vi.fn().mockImplementation(() => {
                    throw new Error('some error')
                })

                await expect(
                    createAndSeedDatabase({
                        dataFilePath: 'path-to/file-to-import',
                        importingFileFunction: failingImport,
                        poolDb: queryMock,
                        closePool: closePoolMock
                    })
                ).rejects.toThrow('some error')
                expect(closePoolMock).toHaveBeenCalledTimes(1)
            })
        })

        describe('Insert entries', () => {
            it('should insert gloses and people in database', async () => {
                await createAndSeedDatabase({
                    dataFilePath: 'path-to/file-to-import',
                    importingFileFunction: importingFileFunctionMock,
                    poolDb: queryMock,
                    closePool: closePoolMock
                })

                expect(queryMock).toHaveBeenCalledTimes(3)
            })

            it('should insert each glose with its properties', async () => {
                await createAndSeedDatabase({
                    dataFilePath: 'path-to/file-to-import',
                    importingFileFunction: importingFileFunctionMock,
                    poolDb: queryMock,
                    closePool: closePoolMock
                })

                expect(queryMock).toHaveBeenNthCalledWith(1, INSERT_GLOSE('public'), [
                    'Invented by Alistair Cockburn in 2005',
                    'Hexagonale architecture',
                    'Craft',
                    expect.any(String),
                    ['CRAFT']
                ])
            })

            it('should insert each person with INSERT_PERSON and its properties', async () => {
                await createAndSeedDatabase({
                    dataFilePath: 'path-to/file-to-import',
                    importingFileFunction: importingFileFunctionMock,
                    poolDb: queryMock,
                    closePool: closePoolMock
                })

                expect(queryMock).toHaveBeenNthCalledWith(3, INSERT_PERSON('public'), [
                    'Alistair',
                    'Cockburn',
                    null,
                    'https://alistair.cockburn.us',
                    null,
                    'Inventor of the hexagonal architecture',
                    1953,
                    'Craft, Architecture',
                    expect.any(String)
                ])
            })

            it('should only insert gloses when there is no people', async () => {
                const glosesOnlyMock = vi.fn().mockReturnValue({
                    gloses: [{ description: 'Invented by Eric Evans in 2003', tags: 'DDD', title: 'DDD', themes: [] }],
                    people: []
                })

                await createAndSeedDatabase({
                    dataFilePath: 'path-to/file-to-import',
                    importingFileFunction: glosesOnlyMock,
                    poolDb: queryMock,
                    closePool: closePoolMock
                })

                expect(queryMock).toHaveBeenCalledTimes(1)
                expect(queryMock).toHaveBeenCalledWith(INSERT_GLOSE('public'), expect.any(Array))
            })
            // TODO theme is mandatory ?
        })
    })
})
