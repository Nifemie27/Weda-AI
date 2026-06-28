# Wéda Weather — AI-Powered Weather & Travel Assistant

An intelligent weather and travel assistant that helps users make informed travel decisions. Rather than simply displaying weather data, Wéda Weather answers: **"What should I know before travelling here?"**

Built by **Oluwanifemi Oripeloye** as part of the [PM Accelerator](https://www.pmaccelerator.io/) AI Engineering programme.

---

## Features

### Core Weather

- **Multi-format search** — city, town, postal code, ZIP, coordinates, or browser geolocation
- **Current weather** — temperature, feels like, humidity, pressure, wind, visibility, clouds, sunrise/sunset, timezone
- **5-day forecast** — daily high/low, rain chance, wind, condition, summary
- **Hourly forecast** — 24-hour scrollable forecast with rain probability
- **Air quality** — AQI index with pollutant component breakdown

### AI-Powered Insights

- **Travel conditions** — driving, walking, cycling, and flight disruption scores (0–100)
- **Weather insights** — categorised recommendations (travel, health, activity, packing, warning) with severity levels
- **Natural language summary** — human-readable weather narrative
- **Travel Health Advisor** — UV protection, air quality, heat/cold, hydration, and allergen advice
- **Smart Packing Assistant** — weather-based packing checklist with interactive progress tracking and priority badges

### Travel Features

- **Destination comparison** — side-by-side weather comparison between two locations
- **Trip planner** — CRUD travel plans with dates, notes, status workflow, and weather snapshots
- **Favourites** — save locations, quick-access sidebar, one-click weather loading
- **Google Maps** — embedded map for each searched destination
- **YouTube travel videos** — relevant travel guide videos with in-app modal player

### Data Management

- **Search history** — filter, sort, paginate, and delete past searches
- **Export** — JSON, CSV, PDF, and Markdown export for search history and trips
- **Database persistence** — all data stored in Supabase PostgreSQL via Prisma

---

## Architecture

### Clean Architecture with Feature-Based Modules

```
src/
├── app/                    # Next.js App Router — pages and API routes only
│   ├── (dashboard)/        # Route group: weather, compare, trips, history, about
│   └── api/                # REST API route handlers
├── features/               # Feature modules (self-contained)
│   ├── weather/            # components, hooks, services, types, utils
│   ├── travel/             # health advisor, travel videos
│   ├── packing/            # packing service, checklist component
│   ├── trips/              # trip CRUD hooks and components
│   ├── search/             # search bar, history, favourites, geocoding
│   ├── comparison/         # destination comparison
│   └── export/             # export button, download hook
├── components/             # Shared UI (shadcn/ui, layout, common)
├── lib/                    # Infrastructure (Prisma, API client, validators, constants)
├── hooks/                  # Shared hooks (useDebounce, useGeolocation)
├── providers/              # React context providers
└── types/                  # Global type definitions
```

### Data Flow

```
UI Component → Custom Hook → TanStack Query → API Client → Route Handler → Zod Validation → Service → External API / Prisma
```

Every layer has a single responsibility. UI components never call APIs directly. Business logic never lives in components. External API responses are transformed into normalized app types before reaching the UI.

### API Response Format

```typescript
{ success: true, data: T }                                    // Single record
{ success: true, data: T[], meta: { total, page, pageSize } } // Paginated list
{ success: false, error: { code: string, message: string } }  // Error
```

---

## Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Framework  | Next.js 16 (App Router, Turbopack)   |
| Language   | TypeScript (strict mode)             |
| Styling    | Tailwind CSS v4                      |
| Components | shadcn/ui (base-ui)                  |
| State      | TanStack Query v5                    |
| Forms      | React Hook Form + Zod v4             |
| Animation  | Framer Motion                        |
| ORM        | Prisma 7                             |
| Database   | Supabase PostgreSQL                  |
| Testing    | Vitest + React Testing Library       |
| Deployment | Vercel                               |
| Tooling    | ESLint, Prettier, Husky, lint-staged |

---

## Database Schema

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│     users         │     │  weather_searches │     │   favourite_locations │
├──────────────────┤     ├──────────────────┤     ├──────────────────────┤
│ id (PK)          │────<│ user_id (FK)     │     │ user_id (FK)         │
│ email (unique)   │     │ query            │     │ city, country        │
│ name             │     │ lat, lon, city   │     │ lat, lon             │
│ created_at       │     │ temperature ...  │     │ nickname, notes      │
│ updated_at       │     │ forecast (JSON)  │     │ weather_snapshot     │
└──────────────────┘     │ created_at       │     └──────────────────────┘
         │               └──────────────────┘
         │
         ├───<┌──────────────────┐     ┌──────────────────────┐
         │    │      trips        │     │  weather_comparisons  │
         │    ├──────────────────┤     ├──────────────────────┤
         │    │ user_id (FK)     │     │ user_id (FK)         │
         │    │ destination      │     │ location_a_* fields  │
         │    │ start/end date   │     │ location_b_* fields  │
         │    │ status (enum)    │     │ snapshots (JSON)     │
         │    │ notes, packing   │     │ created_at           │
         │    │ weather (JSON)   │     └──────────────────────┘
         │    └──────────────────┘
         │
         └───<┌──────────────────┐
              │  export_history   │
              ├──────────────────┤
              │ format (enum)    │
              │ export_type      │
              │ record_count     │
              │ file_name        │
              └──────────────────┘
```

**6 tables**, 3 enums (`TripStatus`, `ExportFormat`, `ExportType`), with indexes on all foreign keys and frequently queried fields.

---

## API Documentation

### Weather

| Method | Endpoint                             | Description                            |
| ------ | ------------------------------------ | -------------------------------------- |
| `GET`  | `/api/weather/current?q=London`      | Current weather + forecast + hourly    |
| `GET`  | `/api/weather/forecast?q=Paris`      | 5-day + hourly forecast                |
| `GET`  | `/api/weather/air-quality?lat=&lon=` | Air quality index + components         |
| `GET`  | `/api/geocode?q=Tokyo`               | Geocoding (city, zip, coords, reverse) |
| `GET`  | `/api/insights?q=London`             | AI insights + travel scores            |
| `GET`  | `/api/youtube?q=London`              | Travel guide videos                    |

### CRUD

| Method           | Endpoint                | Description                      |
| ---------------- | ----------------------- | -------------------------------- |
| `GET/POST`       | `/api/trips`            | List (paginated) / Create trip   |
| `GET/PUT/DELETE` | `/api/trips/[id]`       | Read / Update / Delete trip      |
| `GET/POST`       | `/api/favourites`       | List / Add favourite             |
| `GET/PUT/DELETE` | `/api/favourites/[id]`  | Read / Update / Delete favourite |
| `GET/DELETE`     | `/api/history`          | List (paginated) / Clear all     |
| `GET/DELETE`     | `/api/history/[id]`     | Read / Delete search record      |
| `GET/POST`       | `/api/comparisons`      | List / Create comparison         |
| `GET/DELETE`     | `/api/comparisons/[id]` | Read / Delete comparison         |

### Export

| Method | Endpoint      | Description                                |
| ------ | ------------- | ------------------------------------------ |
| `POST` | `/api/export` | Export data as JSON, CSV, PDF, or Markdown |

---

## Installation

### Prerequisites

- Node.js 18+
- npm
- A Supabase account (free tier works)
- An OpenWeatherMap API key (free tier)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd weda-weather

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## Environment Variables

Create a `.env.local` file from `.env.example`:

| Variable                          | Required | Description                                                       |
| --------------------------------- | -------- | ----------------------------------------------------------------- |
| `DATABASE_URL`                    | Yes      | Supabase PostgreSQL connection (pooler, port 6543)                |
| `DIRECT_URL`                      | Yes      | Supabase PostgreSQL direct connection (port 5432, for migrations) |
| `OPENWEATHERMAP_API_KEY`          | Yes      | [OpenWeatherMap](https://openweathermap.org/api) API key          |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No       | Google Maps Embed API key                                         |
| `YOUTUBE_API_KEY`                 | No       | YouTube Data API v3 key                                           |
| `ANTHROPIC_API_KEY`               | No       | Claude API key (for optional LLM insights)                        |
| `NEXT_PUBLIC_APP_URL`             | Yes      | App URL (e.g. `http://localhost:3000`)                            |

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

**76 tests** across 6 suites covering weather insights, packing generation, health advice, Zod validation, utility functions, and pagination helpers.

---

## Deployment

### Vercel (Recommended)

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables in Vercel's project settings
4. Vercel auto-detects Next.js and deploys

The `vercel.json` configures:

- Build command: `prisma generate && next build`
- Security headers on API routes (nosniff, DENY framing, strict referrer)

### Docker

The project includes a multi-stage Dockerfile and docker-compose for containerised deployment.

```bash
# Run with Docker Compose (app + local PostgreSQL)
docker compose up --build

# Or build the image standalone
docker build -t weda-weather .
docker run -p 3000:3000 --env-file .env.local weda-weather
```

The Dockerfile uses a 3-stage build:

1. **deps** — installs dependencies (cached layer)
2. **builder** — generates Prisma client and builds Next.js (standalone output)
3. **runner** — minimal Alpine image with only production artifacts (~150MB)

`docker-compose.yml` includes a local PostgreSQL 16 instance, so you can develop without Supabase.

### Manual Build

```bash
npx prisma generate
npm run build
npm start
```

---

## Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start dev server (Turbopack) |
| `npm run build`      | Production build             |
| `npm start`          | Start production server      |
| `npm test`           | Run tests                    |
| `npm run lint`       | Run ESLint                   |
| `npm run format`     | Format with Prettier         |
| `npm run type-check` | TypeScript type check        |
| `npm run db:migrate` | Run Prisma migrations        |
| `npm run db:studio`  | Open Prisma Studio           |

---

## Folder Structure

```
weda-weather/
├── prisma/
│   ├── schema.prisma          # Database schema (6 tables, 3 enums)
│   └── migrations/            # Migration history
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (dashboard)/       # Pages: weather, compare, trips, history, about
│   │   └── api/               # 14 API route handlers
│   ├── features/              # 7 feature modules
│   ├── components/            # Shared UI (shadcn/ui + layout + common)
│   ├── lib/                   # Prisma, API client, validators, constants
│   ├── hooks/                 # useDebounce, useGeolocation
│   ├── providers/             # QueryProvider, AppProviders
│   └── types/                 # Global types (ApiResponse, Pagination)
├── tests/
│   └── unit/                  # 6 test suites, 76 tests
├── .env.example               # Environment variable template
├── CLAUDE.md                  # Architecture reference
├── vercel.json                # Vercel deployment config
└── vitest.config.ts           # Test configuration
```

---

## Future Improvements

- **Authentication** — Supabase Auth to tie data to user accounts
- **PWA** — offline caching, push notifications for weather alerts
- **Internationalisation** — multi-language support
- **Real-time updates** — WebSocket for live weather changes
- **LLM integration** — Claude API for richer natural-language insights
- **Analytics** — usage tracking with Vercel Analytics
- **Weather alerts** — severe weather push notifications
- **Historical weather** — compare current conditions to historical averages
- **Travel cost estimation** — integrate flight/hotel pricing APIs
- **Social sharing** — share weather cards and trip plans

---

## Licence

MIT

---

Built with Next.js, TypeScript, and real-time weather data from OpenWeatherMap.
