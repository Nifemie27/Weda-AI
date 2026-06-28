@AGENTS.md

# Wéda AI — AI-Powered Weather & Travel Assistant

## Quick Reference

- **Stack**: Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn/ui (base-ui), Prisma 7, Supabase PostgreSQL, TanStack Query, Framer Motion, Zod v4
- **Dev server**: `npm run dev` (Turbopack, port 3000)
- **Type check**: `npx tsc --noEmit`
- **Lint**: `npx eslint .`
- **Format**: `npx prettier --write .`
- **DB migrate**: `npx prisma migrate dev --name <name>`
- **DB generate**: `npx prisma generate` (then DATABASE_URL env var required)
- **DB studio**: `npx prisma studio`

## Architecture

### Layer Separation (strict — never skip layers)

```
UI Component → Custom Hook → TanStack Query → API Client → Route Handler → Zod Validation → Service → External API / Prisma
```

### Folder Conventions

- `src/app/` — Next.js App Router pages and API route handlers only. No business logic.
- `src/features/<name>/` — Feature modules. Each has: `components/`, `hooks/`, `services/`, `types/`, `utils/`. If only one feature uses it, it lives in that feature.
- `src/components/ui/` — shadcn/ui components (auto-generated, don't hand-edit).
- `src/components/common/` — Shared components (ErrorBoundary, LoadingSpinner).
- `src/components/layout/` — Header, Footer.
- `src/lib/` — Cross-cutting infrastructure: Prisma client, API client, env validation, constants, validators.
- `src/hooks/` — Shared hooks (useDebounce, useGeolocation).
- `src/providers/` — React context providers (QueryProvider, AppProviders).
- `src/types/` — Global type definitions (ApiResponse, Pagination).

### API Response Format

All route handlers return:

```typescript
// Success: { success: true, data: T }
// Error:   { success: false, error: { code: string, message: string } }
// List:    { success: true, data: T[], meta: { total, page, pageSize, totalPages } }
```

Use `successResponse()`, `errorResponse()`, `paginatedResponse()` from `src/lib/api-helpers.ts`.

### Key Patterns

- **shadcn/ui uses base-ui, not Radix** — No `asChild` prop. Use `render` prop instead. `TooltipProvider` uses `delay` not `delayDuration`.
- **Prisma 7 requires adapter** — `new PrismaClient({ adapter: new PrismaPg(...) })`. Import from `@/generated/prisma/client`.
- **Zod v4** — `z.record()` requires two args: `z.record(z.string(), z.unknown())`.
- **Next.js 16 route params** — `params` is a `Promise`: `const { id } = await params`.
- **Environment validation** — `src/lib/env.ts` validates with Zod. Called lazily, not at import time.
- **Fire-and-forget DB writes** — Weather search persistence uses `.catch()` to avoid blocking the response.
- **pre-commit hook** — Husky + lint-staged runs ESLint + Prettier on staged files.

### Database

- 6 tables: `users`, `weather_searches`, `trips`, `favourite_locations`, `weather_comparisons`, `export_history`
- Prisma models use camelCase; DB columns use snake_case via `@map()`
- `prisma.config.ts` uses `DIRECT_URL` for migrations, runtime uses `DATABASE_URL` (pgbouncer)
- Generated client at `src/generated/prisma/` (gitignored)

### ESLint Ignores

- `src/generated/**` — Prisma generated code
