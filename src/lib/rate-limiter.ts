type Entry = {
    count: number
    resetAt: number
}

const store = new Map<string, Entry>()

/**
 * Returns true if the request is allowed, false if the rate limit is exceeded.
 * Uses a fixed window per IP address.
 */
export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = store.get(ip)

    if (!entry || now > entry.resetAt) {
        store.set(ip, { count: 1, resetAt: now + windowMs })
        return true
    }

    if (entry.count >= limit) {
        return false
    }

    entry.count++
    return true
}

export function getIp(req: {
    headers: Record<string, string | string[] | undefined>
    socket: { remoteAddress?: string }
}): string {
    const forwarded = req.headers['x-forwarded-for']
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
    return req.socket.remoteAddress ?? 'unknown'
}
