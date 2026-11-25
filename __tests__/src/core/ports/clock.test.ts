import { describe, expectTypeOf, it } from 'vitest'
import { Clock } from '@/src/core/ports/clock'
import { systemClock } from '@/src/infrastructure/system-clock'
import { fixedClock } from '@/__tests__/fakes/in-memory-feed-subscription-repository'

describe('Clock', () => {
    it('should give the current date', () => {
        expectTypeOf<Clock['now']>().returns.toEqualTypeOf<Date>()
    })

    it('should be implemented by the system clock and the fixed clock used in tests', () => {
        expectTypeOf(systemClock).toExtend<Clock>()
        expectTypeOf(fixedClock(new Date())).toExtend<Clock>()
    })
})
