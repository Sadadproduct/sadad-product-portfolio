# Production Guide — Sadad Product Portfolio

## Architecture

| Environment | Database | Runtime |
|---|---|---|
| Development | SQLite (`server/data/presentation.db`) | `node server/index.js` + Vite |
| Preview / Production | PostgreSQL via `DATABASE_URL` | Vercel (static `dist` + serverless Express) |

Vercel is **stateless**. Never deploy the local SQLite file as the production database.

## Environment variables

Copy `.env.example` → `.env` for local development.

| Variable | Dev | Preview | Production | Notes |
|---|---|---|---|---|
| `NODE_ENV` | — | `production` | `production` | Enables Secure cookies, HSTS, fail-fast JWT |
| `DATABASE_URL` | unset (SQLite) | **required** | **required** | Postgres connection string (PostgreSQL via Vercel Marketplace / Neon) |
| `JWT_SECRET` | optional (≥24 chars recommended) | **required** ≥24 | **required** ≥24 | Server fails to boot in production if missing/weak |
| `JWT_EXPIRES_IN` | `12h` | `12h` | `12h` | Optional |
| `CORS_ORIGIN` | `true` (reflect) | your preview URL | your prod URL | Optional; default allows request origin with credentials |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | seed defaults | set once | set once | Only used when `users` table is empty |
| `EDITOR_EMAIL` / `EDITOR_PASSWORD` | seed defaults | optional | optional | Only when seeding empty DB |
| `PORT` | `8787` | — | — | Local API only |
| `PGSSL` | — | — | — | Set `false` only for local Postgres without SSL |
| `PG_POOL_MAX` | — | `5` | `5` | Pool size |
| `VITE_API_BASE` | empty | empty | empty | Same-origin `/api/...` |
| `APP_URL` | — | preview URL | prod URL | Documented for ops; not required by app |
| `ALLOW_SQLITE_PROD` | — | never | never | Emergency only; do not set on Vercel |

### Secrets to generate

```bash
# JWT_SECRET (32+ bytes hex)
openssl rand -hex 32
```

Never commit real secrets. Rotate `JWT_SECRET` if it was ever committed.

## Database migration (SQLite → Postgres)

1. Backup local SQLite (already under `server/data/backups/` after setup; or):

```bash
npm run db:backup
```

2. Provision PostgreSQL via Vercel Marketplace / Neon and copy `DATABASE_URL`.

3. Apply schema + copy data (preserves IDs, hashes, drafts, audit logs):

```bash
export DATABASE_URL='postgresql://...'
DRY_RUN=1 npm run db:migrate   # inventory only — no Postgres writes
npm run db:migrate             # apply schema + insert missing rows
```

Safe / idempotent: `INSERT ... ON CONFLICT DO NOTHING` (does not overwrite existing Postgres rows). Password hashes are copied as-is (not re-hashed). SQLite is read-only during migrate.

4. Verify counts:

```bash
npm run db:verify
```

## Backup strategy

**Preferred:** use the managed Postgres provider automated backups.

### PostgreSQL via Vercel Marketplace / Neon

- Enable **daily** automated backups in the provider dashboard.
- Retention: keep **≥7 days** (14–30 days recommended for production).
- Point-in-time recovery (PITR) if the plan supports it.

### Manual logical backup

```bash
# Never log the connection string
pg_dump "$DATABASE_URL" --format=custom --file="backup-$(date +%Y%m%d).dump"
```

Restore:

```bash
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" backup-YYYYMMDD.dump
```

### Disaster recovery

1. Provision a new Postgres instance (or restore to existing).
2. Restore from latest `pg_dump` / provider snapshot.
3. Point `DATABASE_URL` on Vercel to the restored DB.
4. Redeploy or restart (env change triggers redeploy).
5. Smoke-test `/api/public/health`, login, draft/publish.

Do **not** treat Admin JSON export as a database backup.

## Vercel setup

1. Import `https://github.com/Sadadproduct/sadad-product-portfolio`
2. Framework: Other / Vite
3. Build: `npm run build`
4. Output: `dist`
5. Node: `20.x` or `22.x`
6. Set Production + Preview env vars: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`
7. Deploy

Routing (`vercel.json`): `/api/*` → Express serverless; SPA fallback for `/`, `/admin`, `/preview`.

## Local production-like run

```bash
export DATABASE_URL='postgresql://...'
export JWT_SECRET="$(openssl rand -hex 32)"
export NODE_ENV=production
npm run build
npm start
```

## Health

`GET /api/public/health` → `{ "ok": true, "database": "ok", "dialect": "postgres" }`

No secrets or credentials in the response.
