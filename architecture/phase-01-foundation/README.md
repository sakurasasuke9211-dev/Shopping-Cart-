# Phase 01 — Foundation

Establish the project skeleton, tech stack, and shared conventions so later phases can land cleanly.

## Goals

- Choose and document the application stack.
- Define monorepo / folder layout for frontend, backend, and shared types.
- Set environment, config, and run scripts for local development.
- Agree accessibility and UX baseline for users aged 45+.

## Recommended stack (MVP)

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React + TypeScript + Vite | Fast SPA, strong typing, simple hosting |
| Styling | CSS modules or plain CSS with design tokens | Full control over large type / contrast without heavy UI kits |
| Backend | Node.js + Express (or Fastify) + TypeScript | Lightweight REST APIs matching the problem statement |
| Inventory source | Google Sheets API + local JSON/CSV/Excel | Matches required inventory architecture |
| Session / cart store | In-memory Map + optional JSON file persistence | Enough for MVP guest sessions |
| Payments | Mock gateway | Demonstrates checkout without real PSP integration |

Stack can be swapped later; contracts in later phases stay the same.

## Target repository layout

```text
/
├── docs/
│   └── ProblemStatement.md
├── architecture/              ← this folder tree
├── apps/
│   ├── web/                   ← React frontend
│   └── api/                   ← Express/Fastify backend
├── packages/
│   └── shared/                ← shared types, tag enums, scoring constants
├── data/
│   ├── inventory.json         ← primary local fallback
│   ├── inventory.csv
│   └── inventory.xlsx
└── README.md
```

## Components delivered in this phase

1. **Root workspace** — npm/pnpm workspaces (or equivalent).
2. **`apps/api`** — health check `GET /api/health`.
3. **`apps/web`** — blank shell with design tokens (font sizes, contrast colors, button sizes).
4. **`packages/shared`** — TypeScript types for `Product`, `UserPreferences`, `RecommendationResult`.
5. **Env template** — `.env.example` for Sheets credentials, ports, fallback path.

## Design tokens (baseline for Phase 05)

Define early so UI work does not invent one-off styles:

- Base body text ≥ 18px; headings larger and high contrast.
- Primary actions: min tap target ~48×48px.
- Prefer text + icon labels; never icon-only critical actions.
- Motion: prefer none or subtle fades only.

## Non-goals

- Product UI screens
- Recommendation logic
- Google Sheets live connection (stub config only)

## Exit criteria

- [x] Local `web` and `api` start successfully.
- [x] Shared types package is importable from both apps.
- [x] Architecture overview links from repo README.
- [x] `.env.example` documents required keys.

## Next phase

→ [Phase 02 — Inventory & Data](../phase-02-inventory-data/)
