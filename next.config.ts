import type { NextConfig } from 'next'

const ContentSecurityPolicy = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data:;
    font-src 'self';
    connect-src 'self';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
`
    .replace(/\s{2,}/g, ' ')
    .trim()

const nextConfig: NextConfig = {
    poweredByHeader: false,
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: ContentSecurityPolicy
                    }
                ]
            }
        ]
    }
}

export default nextConfig
