import { Clock } from '@/src/core/ports/clock'

export const systemClock: Clock = {
    now: () => new Date()
}
