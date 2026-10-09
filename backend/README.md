# TrustMart Backend

A real, working NestJS backend for TrustMart — actual database persistence, actual
REST API, actual WebSocket real-time updates. This is not a mock server.

## What's real vs. simulated

**Real (genuinely works, tested end-to-end):**
- SQLite database (Node's built-in `node:sqlite` — see note below on why not Prisma)
- OTP login: codes are generated, stored, expiry-checked, and verified against the
  database. JWT access + refresh tokens are issued from real user records.
- Browse/search: risk filtering happens in the SQL query itself — a HIGH-risk
  listing is structurally excluded from public results, not just hidden in the UI.
- Checkout → escrow: creates a real order + payment_transaction row, then resolves
  via a simulated provider webhook into a real escrow_transactions row.
- Confirm Receipt: a real DB transaction that flips order status AND releases
  escrow together, so they can never drift out of sync.
- Chat: messages are scanned server-side with pattern matching (advance payment,
  OTP request, phishing link, fake courier) and broadcast live over WebSocket.
- Admin Fraud Queue: Approve/Reject/Escalate actually mutates the underlying
  listing or account status and writes an audit log row.
- Senior Admin escrow release, dispute decisions, user suspension — all real
  writes with role checks (`FRAUD_ANALYST` vs `SENIOR_ADMIN` etc. actually enforced).
- Escrow fee calculation (2.5%, min PKR 50, cap PKR 2,500) is computed from the
  formula every time, not hardcoded per screen.

**Simulated (needs your credentials to become real):**
- SMS delivery for OTP — the code is real, but "sending" it is simulated. In dev
  mode (`NODE_ENV !== production`) the code is returned in the API response as
  `devOtp` so the frontend can auto-fill it. Wire a real provider (e.g. Twilio) in
  `src/auth/auth.service.ts` → `requestOtp()` once you have an account.
- Payment capture — JazzCash/Easypaisa/Raast/Card: `orders.service.ts` →
  `checkout()` creates a real pending payment row, then a `setTimeout` stands in
  for "the provider's webhook came back". Replace that block with a real SDK call
  + real webhook handler once you have merchant credentials for each provider.

## Why SQLite via `node:sqlite`, not Prisma/Postgres

Prisma's `generate` step downloads a native query-engine binary from
`binaries.prisma.sh`. If your environment restricts outbound network access to an
allowlist (as the sandbox this was built in does), that download fails and Prisma
cannot be used at all — not even to talk to Postgres.

`node:sqlite` ships inside Node itself (stable since Node 22.5), so there's zero
external dependency. Every table in `src/db/schema.sql` was written to be directly
portable to Postgres — no SQLite-only syntax. To move to Postgres in your own
environment (which has normal network access):

1. Swap `src/db/db.service.ts`'s internals for a `pg` client (or reintroduce Prisma).
2. Point `DATABASE_URL` at your Postgres instance.
3. Nothing else changes — every service talks to `DbService`'s methods
   (`run`/`get`/`all`), never raw SQLite calls scattered around.

## Setup

```bash
npm install
cp .env.example .env    # edit secrets if you want, defaults work for local dev
npm run build
npm start
# → TrustMart backend listening on http://localhost:4000
```

For active development with auto-restart on file changes:
```bash
npm run dev
```

The database file `trustmart.db` is created automatically on first run and seeded
with the same demo dataset the frontend's mock adapter uses (orders o_1–o_8,
chat threads t_1–t_3, disputes d_1/d_2, messages cm_1–cm_33) — so switching the
frontend from mock to real data doesn't change what you see in the demo, only
where it's coming from.

**If you already have a `trustmart.db` from an earlier version of this
backend, delete it before starting** (`rm trustmart.db` / delete the file on
Windows) — the schema has since gained a `discrepancies` column, and an old
database file won't have it, which will cause an error on write. Deleting it
is safe: it's regenerated and reseeded automatically on the next start.

## Wiring the frontend to this backend

In the frontend project's `.env`:
```
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:4000
```

Two files were added/changed in the frontend to make this work:
- `src/lib/api/httpApi.ts` (new) — real implementation of every method
  `mockApi` exposes, same input/output shapes.
- `src/lib/api/client.ts` (changed) — picks `mockApi` or `httpApi` based on
  `VITE_USE_MOCK_API`.

Auth screens (PW-01) aren't wired into the UI yet, so `httpApi.ts` silently logs
in as one of three fixed demo accounts (buyer/seller/admin) behind the scenes
using the real OTP flow, so every call is still genuinely authenticated. Once a
real login screen exists, replace `ensureSession()` in `httpApi.ts` with the
session token it produces.

## Demo accounts (seeded)

| Role | Phone | Notes |
|---|---|---|
| Buyer | +92 300 1234567 | Ayesha Khan — verified, trust score 82 |
| Business Seller | +92 321 7654321 | Bilal Traders — verified, trust score 91 |
| Seller | +92 345 1112223 | Karachi Mobile Hub — verified |
| Seller (pending) | +92 302 4445556 | Usman Auto — verification pending, flagged in fraud queue |
| Senior Admin | +92 333 9990000 | Hamza Raza |

Any phone number works for login/signup — new numbers auto-create a BUYER account
on first OTP verify.

## API surface

Every endpoint returns `{ data, meta?, requestId }` on success or
`{ code, message, fieldErrors?, requestId }` on error, matching the frontend's
`ApiSuccess<T>` / `ApiError` types exactly (see `src/common/response.ts` and
`src/common/exception.filter.ts`).

Full route list is visible in each `*.controller.ts` file, or by watching the
NestJS boot log (`RouterExplorer` lines) when the server starts.

## Real-time (WebSocket)

Socket.IO gateway at the same port. Events:
- `chat:message` — new message in a thread (join a thread room with `join:thread`)
- `order:update` — order status changed
- `fraud:update` — fraud queue item decided (join the admin room with `join:admin`)

The frontend doesn't subscribe to these yet — that's the next wiring step once
Chat/Orders/Admin screens want live push instead of refetching.

## What's still needed before this is a real production system

- Real payment gateway credentials (JazzCash/Easypaisa/Raast/Card merchant accounts)
- Real SMS provider credentials
- Move `DATABASE_URL` to Postgres for production (see note above)
- Rate limiting on `/auth/otp/request` (currently unlimited — fine for a demo,
  not fine for production, where it becomes an SMS-bombing vector)
- File upload handling for listing media / verification documents / dispute
  evidence — currently all `storage_key`/`url` fields are placeholders (`'#'`)
- Real face-match / liveness verification (currently a manual-review-only flow)
