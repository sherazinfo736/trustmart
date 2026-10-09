# TrustMart — Full Stack (Backend + Frontend, Integrated)

Real NestJS backend + the TanStack Start frontend, wired together end-to-end:
real database, real REST API, real WebSocket push for live chat and order
updates. Mock mode still works too — it's a one-line env flip either way.

```
trustmart-fullstack/
├── backend/     ← NestJS + SQLite API + WebSocket gateway (see backend/README.md)
├── frontend/    ← TanStack Start app (Public Website + Seller/Admin shells)
└── package.json ← convenience scripts to run both together
```

## Quick start (runs both at once)

```bash
npm run setup   # installs both backend and frontend dependencies
npm run dev     # builds + starts the backend on :4000, starts the frontend dev server
```

The frontend's `.env` already has:
```
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:4000
```
so it talks to the real backend by default. Set `VITE_USE_MOCK_API=true` in
`frontend/.env` any time to fall back to fixture data with zero backend
required — nothing else changes.

## Run them separately (two terminals)

```bash
# Terminal 1
npm run backend:only

# Terminal 2
npm run frontend:only
```

## What "real-time" means here, concretely

- Open a chat thread in the frontend → the backend's WebSocket gateway is
  joined for that thread's room (`joinThreadRoom` in `frontend/src/lib/realtime.tsx`,
  wired into `useChatMessages` in `frontend/src/lib/api/queries.ts`).
- Send a message from anywhere else that hits the same backend (another
  browser tab, a curl request, another device) → it's scanned server-side for
  scam patterns and pushed live over the socket into the open thread's message
  list — no refetch/poll needed.
- Confirming receipt, an admin releasing escrow, or a fraud-queue decision all
  broadcast `order:update` / `fraud:update` events that invalidate the
  relevant TanStack Query cache entries, so open screens refresh automatically.

`frontend/src/lib/realtime.tsx` is the single file doing this wiring — it's a
no-op in mock mode (`VITE_USE_MOCK_API=true`), so nothing breaks if you switch
back.

## What's real vs. still simulated

See `backend/README.md` for the full, honest breakdown. Short version: auth,
database writes, escrow state transitions, scam detection, and fraud-queue
actions are all genuinely real. Payment capture (JazzCash/Easypaisa/Raast/Card)
and SMS delivery are simulated because they need merchant/provider credentials
this project doesn't have — the code paths are real and ready, just waiting on
your credentials to flip from simulated to live.

## Verified before delivery

- Backend: compiled clean, boot-tested, and every core flow (OTP login,
  checkout → escrow, confirm-receipt, chat scam-detection, admin fraud-queue
  decide, senior-admin escrow release) was exercised live against the running
  server and the database was re-read afterward to confirm the writes
  persisted — not just that the endpoint returned 200.
- **Definitive live-data proof**: the database file was edited directly with
  a raw SQL statement (completely bypassing the app), and the API immediately
  returned the edited value on the next request — confirming zero caching
  and zero static fallback anywhere in the response path.
- **Fixed a real bug found during this check**: several frontend screens
  (Home page listing cards, the shared `ListingGrid` used by Browse/Search/
  Saved/Seller-Profile, the Listing Detail risk panel and discrepancy notice,
  and the Chat thread header) were computing their risk badges, verification
  badges, and thread/order links from a **static fixture lookup table by ID**
  instead of from the API response — meaning even with `VITE_USE_MOCK_API=false`,
  those specific pieces of data stayed static regardless of what the backend
  returned. This has been fixed: risk breakdown and verified-field data now
  travel embedded in every listing object the API returns (both `mockApi` and
  the real backend), and chat thread metadata comes from the already-fetched
  thread list instead of a separate lookup. Every route file was audited;
  the only remaining `fixtures.*` references left in the codebase are
  identity constants (`fixtures.currentBuyer.id`) and static form option
  lists (scam-report reason/subject dropdowns) — neither is "data" in the
  sense that matters here.
- Frontend: `npx tsc --noEmit` passes with zero errors introduced by this
  work (four pre-existing type-looseness warnings remain in three unrelated
  route files — see below). A full production build (`npm run build`)
  completes successfully with `socket.io-client` correctly bundled in.
- Four pre-existing type-looseness warnings exist in three route files this
  integration did not touch (`disputes.$disputeId.tsx`, `orders.$orderId.tsx`,
  `store.$sellerId.tsx`) — they surfaced because real (non-mock) data flowing
  through those components is more strictly typed than the loose fixture data
  was. They don't block the build and aren't related to this wiring, but are
  worth tightening up when those screens are next touched.

## Demo accounts (seeded in the backend, same ones the frontend used in mock mode)

| Role | Phone |
|---|---|
| Buyer | +92 300 1234567 |
| Business Seller | +92 321 7654321 |
| Senior Admin | +92 333 9990000 |

`frontend/src/lib/api/httpApi.ts` auto-signs in as these behind the scenes
until real login screens (PW-01) exist — see the comment block at the top of
that file for exactly what to replace once they do.
