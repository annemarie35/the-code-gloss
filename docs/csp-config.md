# Content Security Policy (CSP)

CSP is configured in `next.config.ts` via the `headers()` function and applies to all routes (`/(.*)`).

## Directives

| Directive         | Value                                  | Reason                                          |
| ----------------- | -------------------------------------- | ----------------------------------------------- |
| `default-src`     | `'self'`                               | Only load resources from same origin by default |
| `script-src`      | `'self' 'unsafe-inline' 'unsafe-eval'` | Required for Next.js runtime                    |
| `style-src`       | `'self' 'unsafe-inline'`               | Required for Tailwind inline styles             |
| `img-src`         | `'self' data:`                         | Allows same-origin images and data URIs         |
| `font-src`        | `'self'`                               | Same-origin fonts only                          |
| `connect-src`     | `'self'`                               | API calls to same origin only                   |
| `frame-ancestors` | `'none'`                               | Prevents clickjacking                           |
| `base-uri`        | `'self'`                               | Prevents base tag injection                     |
| `form-action`     | `'self'`                               | Forms can only submit to same origin            |

## Adding external resources

If you need to allow external resources, extend the relevant directive in `next.config.ts`:

```ts
// Example: allow Google Fonts
'font-src': "'self' https://fonts.gstatic.com",
'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",

// Example: allow an external API
'connect-src': "'self' https://api.example.com",

// Example: allow images from a CDN
'img-src': "'self' data: https://cdn.example.com",
```

## Notes

- `'unsafe-inline'` and `'unsafe-eval'` on `script-src` are required by the Next.js dev server and its client-side hydration. In a future hardening pass, these can be replaced with nonces or hashes once Next.js stable nonce support is configured.
- `frame-ancestors 'none'` is equivalent to `X-Frame-Options: DENY` and prevents the app from being embedded in iframes.
