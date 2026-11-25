import type { IncomingHttpHeaders } from 'http'

export function isSameOrigin(headers: Pick<IncomingHttpHeaders, 'origin' | 'host'>): boolean {
    const { origin, host } = headers
    if (!origin || !host) return false
    try {
        return new URL(origin).host === host
    } catch {
        return false
    }
}
