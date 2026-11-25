import http, { type IncomingMessage } from 'http'
import https from 'https'
import { isIP } from 'net'
import { FeedReader } from '@/src/core/ports/feed-reader'
import { FeedUnavailableError } from '@/src/core/domain/feed/feed-errors'
import { BlockedAddressError, guardedLookup, isPublicAddress } from '@/src/infrastructure/rss/address-guard'

type Options = {
    lookup?: Parameters<typeof guardedLookup>[0]
    isAllowedAddress?: (ip: string) => boolean
    timeoutMs?: number
    maxBytes?: number
    maxRedirects?: number
}

const REDIRECT_STATUSES = [301, 302, 303, 307, 308]
const FEED_CONTENT_TYPE = /\b(xml|rss|atom)\b/i

class ReadError extends Error {}

export const httpFeedReader = ({
    lookup,
    isAllowedAddress = isPublicAddress,
    timeoutMs = 5_000,
    maxBytes = 2 * 1024 * 1024,
    maxRedirects = 3
}: Options = {}): FeedReader => {
    const safeLookup = guardedLookup(lookup, isAllowedAddress)

    const checkTarget = (url: URL) => {
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw new ReadError(`protocole refusé : ${url.protocol}`)
        }
        // A literal IP is never resolved, so the lookup guard does not see it: check it here
        const host = url.hostname.replace(/^\[|\]$/g, '')
        if (isIP(host) && !isAllowedAddress(host)) throw new BlockedAddressError(host, host)
    }

    const get = (url: URL, signal: AbortSignal) =>
        new Promise<IncomingMessage>((resolve, reject) => {
            const client = url.protocol === 'https:' ? https : http
            const request = client.request(url, {
                method: 'GET',
                agent: false, // no pooled socket: every connection goes through the guarded lookup
                lookup: safeLookup,
                signal,
                headers: {
                    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
                    'User-Agent': 'code-gloss feed reader'
                }
            })
            request.on('response', resolve)
            request.on('error', reject)
            request.end()
        })

    const readBody = async (response: IncomingMessage): Promise<string> => {
        if (Number(response.headers['content-length']) > maxBytes) {
            response.destroy()
            throw new ReadError(`flux trop gros : plus de ${maxBytes} octets annoncés`)
        }
        const chunks: Buffer[] = []
        let size = 0
        for await (const chunk of response) {
            size += chunk.length
            if (size > maxBytes) {
                response.destroy()
                throw new ReadError(`flux trop gros : plus de ${maxBytes} octets`)
            }
            chunks.push(chunk)
        }
        return Buffer.concat(chunks).toString('utf-8')
    }

    const fetchFeed = async (startUrl: string, signal: AbortSignal): Promise<string> => {
        let url = new URL(startUrl)
        for (let hop = 0; hop <= maxRedirects; hop++) {
            checkTarget(url)
            const response = await get(url, signal)
            const status = response.statusCode ?? 0

            if (REDIRECT_STATUSES.includes(status)) {
                response.resume()
                const location = response.headers.location
                if (!location) throw new ReadError(`redirection ${status} sans Location`)
                url = new URL(location, url) // every hop is checked again at the top of the loop
                continue
            }
            if (status < 200 || status >= 300) {
                response.resume()
                throw new ReadError(`statut HTTP ${status}`)
            }
            const contentType = response.headers['content-type'] ?? ''
            if (!FEED_CONTENT_TYPE.test(contentType)) {
                response.resume()
                throw new ReadError(`type de contenu refusé : ${contentType || 'absent'}`)
            }
            return readBody(response)
        }
        throw new ReadError(`trop de redirections (plus de ${maxRedirects})`)
    }

    return {
        async read(url) {
            const signal = AbortSignal.timeout(timeoutMs)
            try {
                return await fetchFeed(url, signal)
            } catch (error) {
                if (signal.aborted) throw new FeedUnavailableError(url, `délai dépassé (${timeoutMs} ms)`)
                throw new FeedUnavailableError(url, error instanceof Error ? error.message : String(error))
            }
        }
    }
}
