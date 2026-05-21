# Rate Limiting

Rate limiting is implemented in `src/lib/rate-limiter.ts` and applied to all API routes to prevent brute force attacks.

- In-memory fixed-window rate limiter (no new dependency)
- rateLimit(ip, limit, windowMs) — returns false when limit exceeded
- getIp(req) — extracts client IP from x-forwarded-for or socket

Limits applied (per IP, per 60s window):

┌─────────────┬────────┬────────────┐
│ Endpoint │ Method │ Limit │
├─────────────┼────────┼────────────┤
│ /api/gloses │ POST │ 10 req/min │
├─────────────┼────────┼────────────┤
│ /api/gloses │ GET │ 60 req/min │
├─────────────┼────────┼────────────┤
│ /api/rss │ GET │ 30 req/min │
└─────────────┴────────┴────────────┘

Rate-limited requests return 429 Too Many Requests. The POST check happens before the origin check, so brute-force attempts are rejected before
any other processing.

Note: This in-memory store resets on server restart and doesn't share state across multiple instances. For a multi-instance deployment, replace
store with a Redis-backed counter.

## Implementation

A simple in-memory fixed-window rate limiter — no external dependency required.

| File                      | Role                                |
| ------------------------- | ----------------------------------- |
| `src/lib/rate-limiter.ts` | Utility:`rateLimit()` and `getIp()` |
| `src/pages/api/gloses.ts` | Applies limits to POST and GET      |
| `src/pages/api/rss.ts`    | Applies limit to GET                |

## Limits

| Endpoint      | Method | Limit        |
| ------------- | ------ | ------------ |
| `/api/gloses` | POST   | 10 req / 60s |
| `/api/gloses` | GET    | 60 req / 60s |
| `/api/rss`    | GET    | 30 req / 60s |

Requests exceeding the limit receive `429 Too Many Requests`.

## How it works

Requests are tracked per IP address using a `Map`. Each entry stores a request count and a reset timestamp. When the window expires, the counter resets.

IP is extracted from the `x-forwarded-for` header (set by proxies/load balancers) and falls back to `req.socket.remoteAddress`.

## Limitations

- The store is **in-memory**: it resets on server restart and is **not shared across multiple instances**.
- For a multi-instance or serverless deployment, replace the `Map` store with a Redis-backed counter (e.g. `rate-limiter-flexible` with an `ioredis` client).
