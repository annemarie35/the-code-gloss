import { describe, expect, it } from 'vitest'
import { formatDate } from '@/src/helpers/date-formatter.ts'

describe('formatDate', () => {
    it('should format date to human readable date', () => {
        const formattedDate = formatDate('2023-05-10T00:00:00.000Z')

        expect(formattedDate).toEqual('10 mai 2023')
    })
})
