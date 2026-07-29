# Phase 01 — Tech stack decisions

## Runtime & language

- **TypeScript** end-to-end for shared contracts between UI and API.
- **Node.js LTS** for the API process.

## Frontend

| Concern | Decision |
|---------|----------|
| Framework | React 18+ with Vite |
| Routing | React Router |
| Forms / questionnaire | Controlled local state (step machine); no heavy form library required for MVP |
| Data fetching | `fetch` wrappers in `apps/web/src/api` |
| Auth (MVP) | Guest session ID in `localStorage` / cookie; optional lightweight login stub |

## Backend

| Concern | Decision |
|---------|----------|
| HTTP framework | Express or Fastify |
| Validation | Zod (shared schemas where practical) |
| Inventory cache | In-memory after load; refresh interval or manual reload |
| Persistence | File/JSON for orders in MVP; no mandatory SQL |

## External integrations

| Integration | MVP approach |
|-------------|----------------|
| Google Sheets | Service account or API key; read-only inventory range |
| Local files | `data/inventory.json` primary fallback; also CSV/Excel parsers |
| Payment | Mock endpoints that always succeed after validation |

## Security baseline (MVP)

- Do not commit Sheets credentials.
- Validate all POST bodies.
- Rate-limit recommendation and payment endpoints lightly.
- Sanitize product HTML if any rich text is later introduced (plain text in MVP).

## Observability

- Structured request logs with `sessionId` when present.
- Inventory source used (`sheets` | `json` | `csv` | `xlsx`) logged on each load.
