import { describe, it, expect, vi, afterEach } from 'vitest'
import { rateLimit, getIp } from '@/src/lib/rate-limiter'

afterEach(() => {
    vi.useRealTimers()
})

describe('rateLimit', () => {
    it('allows requests within the limit', () => {
        expect(rateLimit('ip-allow-1', 3, 60_000)).toBe(true)
        expect(rateLimit('ip-allow-1', 3, 60_000)).toBe(true)
        expect(rateLimit('ip-allow-1', 3, 60_000)).toBe(true)
    })

    it('blocks the request that exceeds the limit', () => {
        rateLimit('ip-block-1', 2, 60_000)
        rateLimit('ip-block-1', 2, 60_000)
        expect(rateLimit('ip-block-1', 2, 60_000)).toBe(false)
    })

    it('continues blocking while the window has not expired', () => {
        rateLimit('ip-block-2', 1, 60_000)
        expect(rateLimit('ip-block-2', 1, 60_000)).toBe(false)
        expect(rateLimit('ip-block-2', 1, 60_000)).toBe(false)
    })

    it('resets the counter after the window expires', () => {
        vi.useFakeTimers()
        rateLimit('ip-reset-1', 1, 1_000)
        expect(rateLimit('ip-reset-1', 1, 1_000)).toBe(false)
        vi.advanceTimersByTime(1_001)
        expect(rateLimit('ip-reset-1', 1, 1_000)).toBe(true)
    })

    it('tracks different IPs independently', () => {
        rateLimit('ip-a', 1, 60_000)
        expect(rateLimit('ip-a', 1, 60_000)).toBe(false)
        expect(rateLimit('ip-b', 1, 60_000)).toBe(true)
    })
})

describe('getIp', () => {
    it('extracts the first IP from x-forwarded-for header', () => {
        const req = { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }, socket: { remoteAddress: '9.9.9.9' } }
        expect(getIp(req)).toBe('1.2.3.4')
    })

    it('falls back to socket.remoteAddress when x-forwarded-for is absent', () => {
        const req = { headers: {}, socket: { remoteAddress: '9.9.9.9' } }
        expect(getIp(req)).toBe('9.9.9.9')
    })

    it('returns "unknown" when no IP can be determined', () => {
        const req = { headers: {}, socket: {} }
        expect(getIp(req)).toBe('unknown')
    })
})
