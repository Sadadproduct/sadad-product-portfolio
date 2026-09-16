# Architecture Decision Record

## Choice: Express + JWT + SQLite (dev) / PostgreSQL (prod)

### Why not Supabase / Firebase / heavy ORM
- Preserve existing Express + JWT + Audit architecture.
- No SaaS lock-in for auth; secrets stay server-side.
- Dual database via thin adapter — presentation/API unaware of dialect.
- Production on Vercel is **stateless** → PostgreSQL via `DATABASE_URL` (PostgreSQL via Vercel Marketplace / Neon).
- Development keeps local SQLite (`node:sqlite`) for zero-friction demos.

### Stack
| Layer | Technology | Reason |
|-------|------------|--------|
| Public UI | Existing Vite/React (unchanged visuals) | Constraint: no redesign |
| Admin UI | Same Vite app, `/admin/*` routes | Logical separation, one deploy |
| API | Express (local + Vercel serverless `/api`) | Minimal adaptation |
| DB (dev) | SQLite file | Local CMS |
| DB (prod) | PostgreSQL (`DATABASE_URL`) | Durable data on Vercel |
| Auth | bcryptjs + JWT httpOnly cookie | Server-side auth |
| AuthZ | Role middleware (`admin`, `editor`) | Not UI-only hiding |
| Public data | `GET /api/public/presentation` | BO is source of truth |

### Production docs
See [`docs/PRODUCTION.md`](./docs/PRODUCTION.md) for migration, backup, env vars, and Vercel setup.
