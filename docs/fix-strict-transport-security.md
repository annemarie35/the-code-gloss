# Strict Transport Security (HSTS)

HSTS is configured in `next.config.ts` alongside the CSP header, inside the `headers()` function applied to all routes (`/(.*)`).

## Header value

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

| Directive           | Value      | Reason                                                             |
| ------------------- | ---------- | ------------------------------------------------------------------ |
| `max-age`           | `63072000` | 2 years in seconds — minimum required for HSTS preload eligibility |
| `includeSubDomains` | —          | Enforces HTTPS on all subdomains                                   |
| `preload`           | —          | Allows submission to browser HSTS preload lists                    |

## What it does

HSTS instructs browsers to only connect to the app over HTTPS for the duration of `max-age`. Once a browser has seen the header, it will refuse plain HTTP connections and automatically upgrade them, protecting against protocol downgrade attacks and cookie hijacking.

## Configuration location

`next.config.ts` — added to the same `headers()` block as the CSP:

```ts
{
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
}
```

## Notes

- HSTS only takes effect over HTTPS. In local development (HTTP), browsers ignore this header.
- The `preload` directive requires the site to be submitted to [hstspreload.org](https://hstspreload.org) separately — the header alone does not auto-enroll it.
- Once a browser caches HSTS with a long `max-age`, reverting to HTTP is not trivial. Only add `preload` if you are confident HTTPS will always be available on this domain and all its subdomains.
