// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { LookupAddress, LookupOptions } from 'dns'
import { BlockedAddressError, guardedLookup, isPublicAddress } from '@/src/infrastructure/rss/address-guard'

describe('isPublicAddress', () => {
    it.each([
        ['127.0.0.1', 'loopback'],
        ['0.0.0.0', 'this network'],
        ['10.1.2.3', 'private 10/8'],
        ['172.16.0.1', 'private 172.16/12, start'],
        ['172.31.255.255', 'private 172.16/12, end'],
        ['192.168.1.1', 'private 192.168/16'],
        ['169.254.169.254', 'link-local (cloud metadata)'],
        ['100.64.0.1', 'shared address space (CGNAT)'],
        ['192.0.0.1', 'IETF protocol assignments'],
        ['192.0.2.1', 'documentation'],
        ['198.18.0.1', 'benchmarking'],
        ['224.0.0.1', 'multicast'],
        ['255.255.255.255', 'broadcast'],
        ['::1', 'IPv6 loopback'],
        ['::', 'IPv6 unspecified'],
        ['fc00::1', 'IPv6 unique local'],
        ['fd12:3456::1', 'IPv6 unique local'],
        ['fe80::1', 'IPv6 link-local'],
        ['ff02::1', 'IPv6 multicast'],
        ['2001:db8::1', 'IPv6 documentation'],
        ['::ffff:127.0.0.1', 'IPv4-mapped loopback'],
        ['::ffff:a00:1', 'IPv4-mapped 10.0.0.1, hex form'],
        ['64:ff9b::a00:1', 'NAT64 of 10.0.0.1'],
        ['2002:a00:1::1', '6to4 of 10.0.0.1'],
        ['not-an-ip', 'not an address']
    ])('should refuse %s (%s)', (ip) => {
        expect(isPublicAddress(ip)).toBe(false)
    })

    it.each([['8.8.8.8'], ['93.184.216.34'], ['172.32.0.1'], ['2606:4700:4700::1111'], ['::ffff:8.8.8.8']])(
        'should accept the public address %s',
        (ip) => {
            expect(isPublicAddress(ip)).toBe(true)
        }
    )
})

describe('guardedLookup', () => {
    const fakeDns =
        (answers: Record<string, LookupAddress[]>, calls: LookupOptions[] = []) =>
        (
            hostname: string,
            options: LookupOptions,
            callback: (error: NodeJS.ErrnoException | null, addresses: LookupAddress[]) => void
        ) => {
            calls.push(options)
            const addresses = answers[hostname]
            if (!addresses)
                return callback(Object.assign(new Error(`ENOTFOUND ${hostname}`), { code: 'ENOTFOUND' }), [])
            callback(null, addresses)
        }

    const resolve = (lookup: ReturnType<typeof guardedLookup>, hostname: string, options: LookupOptions = {}) =>
        new Promise<{ address: string | LookupAddress[]; family?: number }>((ok, ko) =>
            lookup(hostname, options, (error, address, family) => (error ? ko(error) : ok({ address, family })))
        )

    const publicHost = {
        'blog.example.com': [
            { address: '93.184.216.34', family: 4 },
            { address: '2606:4700::1', family: 6 }
        ]
    }

    it('should give the first address when a single one is asked', async () => {
        expect(await resolve(guardedLookup(fakeDns(publicHost)), 'blog.example.com')).toEqual({
            address: '93.184.216.34',
            family: 4
        })
    })

    it('should give every address when all are asked', async () => {
        expect(await resolve(guardedLookup(fakeDns(publicHost)), 'blog.example.com', { all: true })).toEqual({
            address: publicHost['blog.example.com'],
            family: undefined
        })
    })

    it('should always check every address the name resolves to', async () => {
        const calls: LookupOptions[] = []
        await resolve(guardedLookup(fakeDns(publicHost, calls)), 'blog.example.com', { family: 0 })

        expect(calls).toEqual([{ family: 0, all: true }])
    })

    it('should refuse a name that resolves to an internal address', async () => {
        const lookup = guardedLookup(fakeDns({ 'internal.example.com': [{ address: '10.0.0.5', family: 4 }] }))

        await expect(resolve(lookup, 'internal.example.com')).rejects.toThrow(
            new BlockedAddressError('internal.example.com', '10.0.0.5')
        )
    })

    it('should refuse a name when only one of its addresses is internal', async () => {
        const lookup = guardedLookup(
            fakeDns({
                'mixed.example.com': [
                    { address: '93.184.216.34', family: 4 },
                    { address: '::1', family: 6 }
                ]
            })
        )

        await expect(resolve(lookup, 'mixed.example.com', { all: true })).rejects.toBeInstanceOf(BlockedAddressError)
    })

    it('should refuse a name that resolves to nothing', async () => {
        const lookup = guardedLookup(fakeDns({ 'empty.example.com': [] }))

        await expect(resolve(lookup, 'empty.example.com')).rejects.toBeInstanceOf(BlockedAddressError)
    })

    it('should let dns errors through', async () => {
        await expect(resolve(guardedLookup(fakeDns({})), 'unknown.example.com')).rejects.toThrow(
            'ENOTFOUND unknown.example.com'
        )
    })

    it('should accept the addresses an injected rule allows', async () => {
        const lookup = guardedLookup(
            fakeDns({ localhost: [{ address: '127.0.0.1', family: 4 }] }),
            (ip) => ip === '127.0.0.1'
        )

        expect(await resolve(lookup, 'localhost')).toEqual({ address: '127.0.0.1', family: 4 })
    })
})
