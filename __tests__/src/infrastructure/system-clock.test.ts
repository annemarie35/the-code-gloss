import { afterEach, describe, expect, it, vi } from 'vitest'
import { systemClock } from '@/src/infrastructure/system-clock'

describe('systemClock', () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return the current date', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-11-25T10:00:00.000Z'))

        expect(systemClock.now()).toEqual(new Date('2026-11-25T10:00:00.000Z'))
    })
})
