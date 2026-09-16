# SADAD Executive Presentation + Back Office

ارائه اجرایی مدیریت محصول سداد + پنل مدیریت داده.

## Architecture

| لایه | فناوری | Production |
|------|--------|------------|
| Public UI | React + Vite | Vercel static (`dist`) |
| Admin UI | `/admin` | همان دامنه |
| API | Express | Vercel serverless (`/api`) |
| Database | SQLite (dev) / **PostgreSQL** (prod) | `DATABASE_URL` |
| Auth | JWT httpOnly cookie + bcrypt | `JWT_SECRET` اجباری در prod |

جزئیات معماری: [`ARCHITECTURE.md`](./ARCHITECTURE.md)  
راهنمای Production / Backup / Migration: [`docs/PRODUCTION.md`](./docs/PRODUCTION.md)

## اجرای محلی (Development)

```bash
npm install
cp .env.example .env   # JWT_SECRET را برای راحتی محلی می‌توانید نگه دارید
npm run dev
```

- Public: http://localhost:5173/
- Admin: http://localhost:5173/admin/login
- API: http://localhost:8787/ (Vite پروکسی `/api` را به همین پورت می‌فرستد)

بدون `DATABASE_URL` از SQLite محلی استفاده می‌شود.

### حساب پیش‌فرض (فقط seed اولیه)

- Admin: `admin@sadad.local` / `Admin@12345`
- Editor: `editor@sadad.local` / `Editor@12345`

در Production حتماً `JWT_SECRET` قوی و رمزها را عوض کنید.

## اسکریپت‌ها

| Script | کار |
|--------|-----|
| `npm run dev` | API + Vite |
| `npm run build` | بیلد فرانت → `dist` |
| `npm start` | Production محلی: API + سرو `dist` |
| `npm run db:backup` | بکاپ SQLite محلی + checksum |
| `npm run db:migrate` | انتقال داده SQLite → PostgreSQL |
| `npm run db:verify` | مقایسه تعداد رکوردها پس از migration |
| `npm run validate:data` | اعتبارسنجی seed |
| `npm run seed:reset` | پاک کردن SQLite و seed مجدد |

## Migration به PostgreSQL

```bash
export DATABASE_URL='postgresql://...'
npm run db:backup
npm run db:migrate
npm run db:verify
```

جزئیات: [`docs/PRODUCTION.md`](./docs/PRODUCTION.md)

## Deploy روی Vercel

1. Import ریپو در Vercel
2. Build: `npm run build` — Output: `dist`
3. Env (Production + Preview):
   - `DATABASE_URL`
   - `JWT_SECRET` (≥24 کاراکتر، مثلاً `openssl rand -hex 32`)
   - `NODE_ENV=production`
4. ابتدا `npm run db:migrate` با همان `DATABASE_URL`
5. Deploy

`vercel.json` مسیرهای `/api/*` را به Express و بقیه را به SPA می‌فرستد.

## ساختار مهم

```
api/              # Vercel serverless entry
server/           # Express app + DB adapters
server/sql/       # schema.postgres.sql
scripts/          # migrate / verify
docs/PRODUCTION.md
src/admin/        # Back Office
src/App.jsx       # Public presentation
```
