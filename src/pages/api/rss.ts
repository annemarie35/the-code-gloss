import type { NextApiRequest, NextApiResponse } from 'next'
import { getGlosesInMemory } from '@/src/lib/service/get-gloses'
import { rateLimit, getIp } from '@/src/lib/rate-limiter'

const RSS_LIMIT = 30
const WINDOW_MS = 60_000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!rateLimit(getIp(req), RSS_LIMIT, WINDOW_MS)) {
        return res.status(429).send('Too Many Requests')
    }
    const gloses = await getGlosesInMemory()

    const items = gloses
        .map(
            (glose) => `
        <item>
            <title><![CDATA[${glose.title}]]></title>
            <description><![CDATA[${glose.description}]]></description>
            <category><![CDATA[${glose.tags}]]></category>
            <pubDate>${new Date(glose.created_at).toUTCString()}</pubDate>
        </item>`
        )
        .join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>Code Gloss</title>
        <link>http://localhost:3000</link>
        <description>Glossaire de termes du développement logiciel</description>
        ${items}
    </channel>
</rss>`

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
    res.status(200).send(xml)
}
