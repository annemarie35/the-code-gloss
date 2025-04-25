import { describe, it, expect, beforeEach, vi } from 'vitest'

import { createAndSeedDatabase } from '../../../../infra/database/scripts/create_gloses_and_seeds.js'

describe('CreateAndSeedDatabase', () => {
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
