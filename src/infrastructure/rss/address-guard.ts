import dns, { type LookupAddress, type LookupOptions } from 'dns'
import { BlockList, isIP, type LookupFunction } from 'net'

// Ranges a feed must never resolve to: loopback, private, link-local (cloud metadata), reserved...
const blocked = new BlockList()
const IPV4_RANGES: [string, number][] = [
    ['0.0.0.0', 8], // this network
    ['10.0.0.0', 8], // private
    ['100.64.0.0', 10], // shared address space (CGNAT)
    ['127.0.0.0', 8], // loopback
    ['169.254.0.0', 16], // link-local, cloud metadata
    ['172.16.0.0', 12], // private
    ['192.0.0.0', 24], // IETF protocol assignments
    ['192.0.2.0', 24], // documentation
    ['192.88.99.0', 24], // 6to4 relay anycast
    ['192.168.0.0', 16], // private
    ['198.18.0.0', 15], // benchmarking
    ['198.51.100.0', 24], // documentation
    ['203.0.113.0', 24], // documentation
    ['224.0.0.0', 4], // multicast
    ['240.0.0.0', 4] // reserved, broadcast
]
const IPV6_RANGES: [string, number][] = [
    ['::', 96], // unspecified, loopback, IPv4-compatible
    ['64:ff9b::', 96], // NAT64: may embed an internal IPv4
    ['64:ff9b:1::', 48], // local-use NAT64
    ['100::', 64], // discard
    ['2001:db8::', 32], // documentation
    ['2002::', 16], // 6to4: may embed an internal IPv4
    ['fc00::', 7], // unique local
    ['fe80::', 10], // link-local
    ['ff00::', 8] // multicast
]
IPV4_RANGES.forEach(([network, prefix]) => blocked.addSubnet(network, prefix, 'ipv4'))
IPV6_RANGES.forEach(([network, prefix]) => blocked.addSubnet(network, prefix, 'ipv6'))

// ::ffff:10.0.0.1 or ::ffff:a00:1 reaches 10.0.0.1: check the embedded IPv4 instead
const toMappedIpv4 = (ipv6: string): string | null => {
    const match = /^::ffff:(.+)$/i.exec(ipv6)
    if (!match) return null
    if (isIP(match[1]) === 4) return match[1]
    const hex = /^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(match[1])
    if (!hex) return null
    const [high, low] = [parseInt(hex[1], 16), parseInt(hex[2], 16)]
    return [high >> 8, high & 0xff, low >> 8, low & 0xff].join('.')
}

export const isPublicAddress = (rawIp: string): boolean => {
    const ip = rawIp.split('%')[0] // drop an IPv6 zone id (fe80::1%eth0)
    const version = isIP(ip)
    if (version === 4) return !blocked.check(ip, 'ipv4')
    if (version === 6) {
        const mapped = toMappedIpv4(ip)
        if (mapped) return isPublicAddress(mapped)
        return !blocked.check(ip, 'ipv6')
    }
    return false
}

export class BlockedAddressError extends Error {
    constructor(hostname: string, address?: string) {
        super(
            address
                ? `${hostname} résout vers une adresse interdite : ${address}`
                : `${hostname} ne résout vers aucune adresse`
        )
        this.name = 'BlockedAddressError'
    }
}

type DnsLookup = (
    hostname: string,
    options: LookupOptions & { all: true },
    callback: (error: NodeJS.ErrnoException | null, addresses: LookupAddress[]) => void
) => void

/**
 * Lookup for http.request: checks every address at connection time, so the address that is
 * checked is the one used (no DNS rebinding between a check and the connection).
 */
export const guardedLookup =
    (lookup: DnsLookup = dns.lookup, isAllowed: (ip: string) => boolean = isPublicAddress): LookupFunction =>
    (hostname, options, callback) => {
        lookup(hostname, { ...options, all: true }, (error, addresses) => {
            if (error) return callback(error, '')
            const forbidden = addresses.find(({ address }) => !isAllowed(address))
            if (addresses.length === 0 || forbidden) {
                return callback(new BlockedAddressError(hostname, forbidden?.address), '')
            }
            if (options.all) return callback(null, addresses)
            callback(null, addresses[0].address, addresses[0].family)
        })
    }
