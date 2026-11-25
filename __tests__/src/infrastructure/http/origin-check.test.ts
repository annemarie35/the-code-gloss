import { describe, expect, it } from 'vitest'
import { isSameOrigin } from '@/src/infrastructure/http/origin-check'

describe('isSameOrigin', () => {
    it('should accept an origin whose host matches the host header', () => {
        expect(isSameOrigin({ origin: 'http://localhost:3000', host: 'localhost:3000' })).toBe(true)
    })

    it.each([
        ['no origin header', { host: 'localhost:3000' }],
        ['no host header', { origin: 'http://localhost:3000' }],
        ['an empty host header', { origin: 'file:///', host: '' }],
        ['an origin on another host', { origin: 'http://evil.example.com', host: 'localhost:3000' }],
        ['an origin on another port', { origin: 'http://localhost:4000', host: 'localhost:3000' }],
        ['a malformed origin', { origin: 'not a url', host: 'localhost:3000' }]
    ])('should refuse a request with %s', (_label, headers) => {
        expect(isSameOrigin(headers)).toBe(false)
    })
})
