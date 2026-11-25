// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import http, { type IncomingMessage, type ServerResponse } from 'http'
import type { AddressInfo } from 'net'
import type { LookupAddress, LookupOptions } from 'dns'
import { httpFeedReader } from '@/src/infrastructure/rss/http-feed-reader'
import { FeedUnavailableError } from '@/src/core/domain/feed/feed-errors'

const RSS = '<rss><channel><title>Blog</title></channel></rss>'

// The local test server plays a public site: only its address (127.0.0.1) is allowed on top of the real rule
type Route = (req: IncomingMessage, res: ServerResponse) => void
const routes: Record<string, Route> = {}
const hits: string[] = []
let server: http.Server
let port: number

const fakeDns =
    (answers: Record<string, string>, calls: string[] = []) =>
    (
        hostname: string,
        _options: LookupOptions,
        callback: (error: NodeJS.ErrnoException | null, addresses: LookupAddress[]) => void
    ) => {
        calls.push(hostname)
        const address = answers[hostname]
        if (!address) return callback(Object.assign(new Error(`ENOTFOUND ${hostname}`), { code: 'ENOTFOUND' }), [])
        callback(null, [{ address, family: address.includes(':') ? 6 : 4 }])
    }

const dns = { 'blog.test': '127.0.0.1', 'internal.test': '10.0.0.5', 'metadata.test': '169.254.169.254' }
const onlyTestServer = (ip: string) => ip === '127.0.0.1'
const reader = (options: Parameters<typeof httpFeedReader>[0] = {}) =>
    httpFeedReader({ lookup: fakeDns(dns), isAllowedAddress: onlyTestServer, ...options })
const blogUrl = (path: string) => `http://blog.test:${port}${path}`

const readError = async (promise: Promise<string>): Promise<FeedUnavailableError> => {
    const error = await promise.then(
        () => null,
        (e: unknown) => e
    )
    expect(error).toBeInstanceOf(FeedUnavailableError)
    return error as FeedUnavailableError
}

beforeAll(async () => {
    server = http.createServer((req, res) => {
        hits.push(req.url ?? '')
        const route = routes[req.url ?? '']
        if (route) return route(req, res)
        res.writeHead(404).end()
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    port = (server.address() as AddressInfo).port
})

afterAll(async () => {
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
})

beforeEach(() => {
    hits.length = 0
    for (const path of Object.keys(routes)) delete routes[path]
})

const xml =
    (body: string, contentType = 'application/rss+xml; charset=utf-8'): Route =>
    (_req, res) =>
        res.writeHead(200, { 'Content-Type': contentType }).end(body)
const redirect =
    (location: string, status = 302): Route =>
    (_req, res) =>
        res.writeHead(status, { Location: location }).end()

describe('httpFeedReader', () => {
    describe('reading a feed', () => {
        it('should return the document of a public feed', async () => {
            routes['/rss'] = xml(RSS)

            expect(await reader().read(blogUrl('/rss'))).toBe(RSS)
        })

        it.each([['text/xml'], ['application/xml'], ['application/atom+xml'], ['application/rss+xml']])(
            'should accept the content type %s',
            async (contentType) => {
                routes['/rss'] = xml(RSS, contentType)

                expect(await reader().read(blogUrl('/rss'))).toBe(RSS)
            }
        )

        it('should refuse a document that is not a feed', async () => {
            routes['/page'] = xml('<html></html>', 'text/html')

            const error = await readError(reader().read(blogUrl('/page')))
            expect(error.message).toBe(`Flux inaccessible : ${blogUrl('/page')}`)
            expect(error.reason).toMatch(/text\/html/)
        })

        it('should refuse a response without content type', async () => {
            routes['/raw'] = (_req, res) => {
                res.removeHeader('Content-Type')
                res.writeHead(200).end(RSS)
            }

            await readError(reader().read(blogUrl('/raw')))
        })

        it('should refuse an error status', async () => {
            const error = await readError(reader().read(blogUrl('/missing')))
            expect(error.reason).toMatch(/404/)
        })

        it('should refuse an url that is not http or https', async () => {
            const error = await readError(reader().read('file:///etc/passwd'))
            expect(error.reason).toMatch(/protocole refusé/)
        })

        it('should let dns errors become an unavailable feed', async () => {
            const error = await readError(reader().read('http://unknown.test/rss'))
            expect(error.reason).toMatch(/ENOTFOUND/)
        })
    })

    describe('SSRF guard', () => {
        it('should refuse a name that resolves to a private address, without connecting', async () => {
            const error = await readError(reader().read(`http://internal.test:${port}/rss`))

            expect(error.reason).toMatch(/10\.0\.0\.5/)
            expect(hits).toEqual([])
        })

        it('should refuse a name that resolves to the cloud metadata address', async () => {
            const error = await readError(reader().read('http://metadata.test/latest/meta-data/'))
            expect(error.reason).toMatch(/adresse interdite : 169\.254\.169\.254/)
        })

        it.each([
            ['http://169.254.169.254/latest/meta-data/'],
            ['http://10.0.0.1/rss'],
            ['http://[::1]/rss'],
            ['http://[::ffff:127.0.0.1]/rss'],
            ['http://2130706433/rss'],
            ['http://0x7f.0.0.1/rss']
        ])('should refuse the literal internal address in %s without resolving it', async (url) => {
            const calls: string[] = []

            const error = await readError(httpFeedReader({ lookup: fakeDns(dns, calls) }).read(url))
            expect(error.reason).toMatch(/adresse interdite/)
            expect(calls).toEqual([])
        })

        it('should refuse localhost with the real rule', async () => {
            routes['/rss'] = xml(RSS)

            const byName = await readError(
                httpFeedReader({ lookup: fakeDns({ localhost: '127.0.0.1' }) }).read(`http://localhost:${port}/rss`)
            )
            const byAddress = await readError(httpFeedReader().read(`http://127.0.0.1:${port}/rss`))
            expect(byName.reason).toMatch(/adresse interdite/)
            expect(byAddress.reason).toMatch(/adresse interdite/)
            expect(hits).toEqual([])
        })
    })

    describe('redirects', () => {
        it('should follow a redirect to a public address, relative or absolute', async () => {
            routes['/old'] = redirect('/middle', 301)
            routes['/middle'] = redirect(blogUrl('/rss'), 307)
            routes['/rss'] = xml(RSS)

            expect(await reader().read(blogUrl('/old'))).toBe(RSS)
            expect(hits).toEqual(['/old', '/middle', '/rss'])
        })

        it.each([
            [
                'a name that resolves to a private address',
                () => `http://internal.test:${port}/rss`,
                /adresse interdite/
            ],
            ['a literal internal address', () => 'http://169.254.169.254/latest/meta-data/', /adresse interdite/],
            ['another protocol', () => 'file:///etc/passwd', /protocole refusé/]
        ])('should refuse a redirect to %s', async (_case, target, reason) => {
            routes['/jump'] = redirect(target())

            const error = await readError(reader().read(blogUrl('/jump')))
            expect(error.reason).toMatch(reason)
            expect(hits).toEqual(['/jump'])
        })

        it('should stop after 3 redirects', async () => {
            routes['/loop'] = redirect('/loop')

            const error = await readError(reader().read(blogUrl('/loop')))
            expect(error.reason).toMatch(/redirection/i)
            expect(hits).toHaveLength(4)
        })

        it('should refuse a redirect without location', async () => {
            routes['/nowhere'] = (_req, res) => res.writeHead(302).end()

            await readError(reader().read(blogUrl('/nowhere')))
        })
    })

    describe('limits', () => {
        it('should give up when the server is too slow', async () => {
            routes['/slow'] = () => {}
            const start = Date.now()

            const error = await readError(reader({ timeoutMs: 100 }).read(blogUrl('/slow')))
            expect(error.reason).toMatch(/délai/)
            expect(Date.now() - start).toBeLessThan(2_000)
        })

        it('should give up when the body arrives too slowly', async () => {
            routes['/drip'] = (_req, res) => {
                res.writeHead(200, { 'Content-Type': 'text/xml' })
                res.write('<rss>')
            }

            const error = await readError(reader({ timeoutMs: 100 }).read(blogUrl('/drip')))
            expect(error.reason).toMatch(/délai/)
        })

        it('should refuse a body bigger than the limit', async () => {
            routes['/big'] = (_req, res) => {
                res.writeHead(200, { 'Content-Type': 'text/xml' })
                res.write('a'.repeat(600))
                res.end('a'.repeat(600))
            }

            const error = await readError(reader({ maxBytes: 1_000 }).read(blogUrl('/big')))
            expect(error.reason).toMatch(/trop gros/)
        })

        it('should refuse an announced length bigger than the limit before reading it', async () => {
            routes['/announced'] = (_req, res) => {
                res.writeHead(200, { 'Content-Type': 'text/xml', 'Content-Length': '5000' })
                res.write('<rss>')
            }

            const error = await readError(reader({ maxBytes: 1_000 }).read(blogUrl('/announced')))
            expect(error.reason).toMatch(/trop gros/)
        })

        it('should accept a body of exactly the limit', async () => {
            routes['/exact'] = xml('a'.repeat(1_000), 'text/xml')

            expect(await reader({ maxBytes: 1_000 }).read(blogUrl('/exact'))).toHaveLength(1_000)
        })
    })
})
