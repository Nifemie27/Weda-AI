# Wéda AI — Weather & Travel Assistant

> An intelligent weather and travel platform that helps users make smarter travel decisions. Instead of just showing weather data, Wéda AI answers the question: **"What should I know before travelling here?"**

**Developer:** Oluwanifemi Oripeloye  
**Programme:** PM Accelerator — AI Engineering  
**Live Demo:** [weda-ai.vercel.app](https://weda-ai.vercel.app)  
**Repository:** [github.com/Nifemie27/Weda-AI](https://github.com/Nifemie27/Weda-AI)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Environment Variables](#environment-variables)
8. [Installation](#installation)
9. [Docker](#docker)
10. [Deployment](#deployment)
11. [Testing](#testing)
12. [Folder Structure](#folder-structure)
13. [About PM Accelerator](#about-pm-accelerator)

---

## Overview

Wéda AI is a full-stack, production-ready weather and travel assistant built with Next.js 16, TypeScript, and Supabase PostgreSQL. It serves both long and short-term travellers, business travellers, daily commuters, digital nomads, and holiday makers with real-time weather data, AI-generated insights, and intelligent travel recommendations — all grounded in live API data.

---

## Features

### Weather

- **Unified location search** — city, town, village, postal code, ZIP code, GPS coordinates, landmarks, and addresses powered by Mapbox
- **Auto-detect location** — browser geolocation loads weather immediately on page visit
- **Current conditions** — temperature, feels like, humidity, wind, pressure, visibility, cloud cover, sunrise/sunset, AQI
- **5-day forecast** — daily high/low, rain probability, wind speed, condition summary with temperature gradient bars
- **24-hour hourly forecast** — scrollable strip with per-hour temperature and rain probability
- **Dynamic backgrounds** — animated weather effects (sun, rain, clouds, snow, lightning, stars) that match current conditions

### AI Travel Intelligence

- **Travel conditions** — driving, walking, cycling, and flight risk scores (0–100)
- **Travel Health Advisor** — UV protection, air quality, heat/cold, hydration recommendations
- **Smart Packing Assistant** — weather-grounded packing checklist with priority ratings and explanations
- **Natural language summary** — readable weather narrative for any destination
- **Destination Comparison** — side-by-side weather analysis between two locations

### Trip Planning

- **Trip Planner** — create and manage trips with destination, date ranges, notes, and status workflow
- **Favourite Locations** — save and quickly access preferred destinations
- **Search History** — automatic logging of every weather search with full weather snapshot

### Integrations

- **Mapbox GL JS** — interactive vector map (dark/light theme adaptive)
- **YouTube Data API** — travel guide videos for any searched location
- **OpenWeatherMap** — live current weather, forecast, and air quality data

### Data Management

- **Full CRUD** — create, read, update, and delete trips, favourites, and search history
- **Data Export** — download records as JSON, CSV, XML, PDF, or Markdown
- **Device isolation** — each browser gets a unique device ID; data is scoped per device

### UI/UX

- **Apple Weather-inspired design** — glassmorphic panels, Poppins font, fluid animations
- **Dark / Light / System theme** — persistent toggle in header
- **Responsive** — mobile-first, works across all screen sizes
- **Recent searches sidebar** — left panel with last 10 deduplicated searches
- **Saved locations sidebar** — right panel with bookmarked destinations

---

## Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Framework  | Next.js 16 (App Router, Turbopack)   |
| Language   | TypeScript (strict mode)             |
| Styling    | Tailwind CSS v4                      |
| Components | shadcn/ui (base-ui)                  |
| Animations | Framer Motion                        |
| State      | TanStack Query v5                    |
| Forms      | React Hook Form + Zod v4             |
| ORM        | Prisma 7                             |
| Database   | Supabase PostgreSQL                  |
| Maps       | Mapbox GL JS + Leaflet (fallback)    |
| Geocoding  | Mapbox Search Box API                |
| Weather    | OpenWeatherMap API                   |
| Videos     | YouTube Data API v3                  |
| Testing    | Vitest + React Testing Library       |
| Deployment | Vercel                               |
| Containers | Docker + Docker Compose              |
| Font       | Poppins (Google Fonts)               |
| Tooling    | ESLint, Prettier, Husky, lint-staged |

---

## Architecture

### Clean Architecture — Feature-Based Modules

```
src/
├── app/                      # Next.js App Router — pages and API routes only
│   ├── (dashboard)/          # Route group: weather, compare, trips, history, about
│   └── api/                  # 14 REST API route handlers
├── features/                 # Self-contained feature modules
│   ├── weather/              # components, hooks, services, types, utils
│   ├── travel/               # health advisor, travel videos
│   ├── packing/              # packing service, interactive checklist
│   ├── trips/                # trip CRUD hooks and components
│   ├── search/               # search bar, history, favourites, geocoding
│   ├── comparison/           # destination comparison
│   └── export/               # export button, download hook
├── components/               # Shared UI (shadcn/ui, layout, common)
├── lib/                      # Infrastructure (Prisma, API client, validators, constants)
├── hooks/                    # Shared hooks (useDebounce, useGeolocation)
├── providers/                # React context providers (QueryProvider, ThemeProvider)
└── types/                    # Global type definitions
```

### Data Flow

```
UI Component
  → Custom Hook
  → TanStack Query (cache)
  → API Client (typed fetch)
  → Route Handler
  → Zod Validation
  → Service Layer
  → External API / Prisma ORM
  → Supabase PostgreSQL
```

Every layer has a single responsibility. UI components never call APIs or databases directly. Business logic never lives in components. External API responses are transformed into normalised internal types before reaching the UI.

### API Response Format

All API endpoints return a consistent envelope:

```typescript
// Success — single record
{ success: true, data: T }

// Success — paginated list
{ success: true, data: T[], meta: { total, page, pageSize, totalPages } }

// Error
{ success: false, error: { code: string, message: string } }
```

---

## Database Schema

Built on **Supabase PostgreSQL** managed via **Prisma 7** with the `@prisma/adapter-pg` adapter.

```
┌──────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│      users        │     │   weather_searches    │     │  favourite_locations  │
├──────────────────┤     ├──────────────────────┤     ├──────────────────────┤
│ id (PK)          │────<│ user_id (FK, nullable)│     │ user_id (FK)         │
│ email (unique)   │     │ device_id            │     │ device_id            │
│ name             │     │ query, lat, lon      │     │ city, country        │
│ created_at       │     │ city, country, state │     │ lat, lon             │
│ updated_at       │     │ temperature, humidity│     │ nickname, notes      │
└──────────────────┘     │ wind, visibility ... │     │ weather_snapshot     │
         │               │ forecast_snapshot    │     └──────────────────────┘
         │               │ created_at           │
         │               └──────────────────────┘
         │
         ├───<┌──────────────────────┐     ┌──────────────────────┐
         │    │        trips          │     │  weather_comparisons  │
         │    ├──────────────────────┤     ├──────────────────────┤
         │    │ device_id            │     │ device_id            │
         │    │ destination          │     │ location_a_* fields  │
         │    │ start_date, end_date │     │ location_b_* fields  │
         │    │ status (enum)        │     │ snapshots (JSON)     │
         │    │ notes, packing_notes │     │ created_at           │
         │    │ weather_snapshot     │     └──────────────────────┘
         │    └──────────────────────┘
         │
         └───<┌──────────────────────┐
              │    export_history     │
              ├──────────────────────┤
              │ device_id            │
              │ format (enum)        │
              │ export_type (enum)   │
              │ record_count         │
              │ file_name            │
              └──────────────────────┘
```

**6 tables · 3 enums** (`TripStatus`, `ExportFormat`, `ExportType`) · indexes on all foreign keys and frequently queried fields · snake_case columns mapped to camelCase Prisma models

---

## API Documentation

### Weather

| Method | Endpoint                             | Description                                      |
| ------ | ------------------------------------ | ------------------------------------------------ |
| `GET`  | `/api/weather/current?q=London`      | Current weather + 5-day + hourly forecast        |
| `GET`  | `/api/weather/forecast?q=Paris`      | 5-day + hourly forecast only                     |
| `GET`  | `/api/weather/air-quality?lat=&lon=` | AQI index + pollutant breakdown                  |
| `GET`  | `/api/geocode?q=Eiffel+Tower`        | Unified geocoding (city, zip, landmark, address) |
| `GET`  | `/api/insights?q=London`             | AI travel insights + travel condition scores     |
| `GET`  | `/api/youtube?q=Tokyo`               | Travel guide videos for any location             |

### CRUD

| Method                   | Endpoint                | Description                          |
| ------------------------ | ----------------------- | ------------------------------------ |
| `GET` · `POST`           | `/api/trips`            | List trips (paginated) / Create trip |
| `GET` · `PUT` · `DELETE` | `/api/trips/[id]`       | Read / Update / Delete trip          |
| `GET` · `POST`           | `/api/favourites`       | List / Save favourite location       |
| `GET` · `PUT` · `DELETE` | `/api/favourites/[id]`  | Read / Update / Delete favourite     |
| `GET` · `DELETE`         | `/api/history`          | Paginated search history / Clear all |
| `GET` · `DELETE`         | `/api/history/[id]`     | Read / Delete single search record   |
| `GET` · `POST`           | `/api/comparisons`      | List / Create comparison             |
| `GET` · `DELETE`         | `/api/comparisons/[id]` | Read / Delete comparison             |

### Export

| Method | Endpoint      | Description                                     |
| ------ | ------------- | ----------------------------------------------- |
| `POST` | `/api/export` | Export data as JSON, CSV, XML, PDF, or Markdown |

---

## Environment Variables

Create a `.env.local` file from `.env.example`:

| Variable                          | Required | Description                                                      |
| --------------------------------- | -------- | ---------------------------------------------------------------- |
| `DATABASE_URL`                    | Yes      | Supabase connection string (pooler, port 6543)                   |
| `DIRECT_URL`                      | Yes      | Supabase direct connection (port 5432, for migrations)           |
| `OPENWEATHERMAP_API_KEY`          | Yes      | [openweathermap.org](https://openweathermap.org/api) — free tier |
| `MAPBOX_ACCESS_TOKEN`             | Yes      | [account.mapbox.com](https://account.mapbox.com) — free tier     |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Yes      | Same Mapbox token (for client-side map)                          |
| `YOUTUBE_API_KEY`                 | No       | YouTube Data API v3 — enables video thumbnails                   |
| `NEXT_PUBLIC_APP_URL`             | Yes      | App URL (e.g. `http://localhost:3000`)                           |

---

## Installation

### Prerequisites

- Node.js 22+
- npm
- A [Supabase](https://supabase.com) project (free tier)
- An [OpenWeatherMap](https://openweathermap.org/api) API key (free tier)
- A [Mapbox](https://account.mapbox.com) access token (free tier)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Nifemie27/Weda-AI.git
cd Weda-AI

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma migrate dev

# 6. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Docker

Run the entire stack (app + local PostgreSQL) with a single command:

```bash
# Build and start
docker compose up --build

# Run in background
docker compose up --build -d

# Stop
docker compose down
```

The `docker-compose.yml` includes a PostgreSQL 16 database so you can run locally without Supabase. For the production Docker build, set `DOCKER_BUILD=1` to enable standalone Next.js output.

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel project settings
4. Vercel auto-detects Next.js and deploys

The `vercel.json` configures the build command as `prisma generate && next build` and applies security headers to all API routes.

### Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start development server (Turbopack) |
| `npm run build`      | Production build                     |
| `npm start`          | Start production server              |
| `npm test`           | Run test suite                       |
| `npm run lint`       | Run ESLint                           |
| `npm run format`     | Format with Prettier                 |
| `npm run type-check` | TypeScript type check                |
| `npm run db:migrate` | Run Prisma migrations                |
| `npm run db:studio`  | Open Prisma Studio                   |

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

**76 tests across 6 suites:**

| Suite                    | Tests | Coverage                                              |
| ------------------------ | ----- | ----------------------------------------------------- |
| `insights.test.ts`       | 18    | Travel condition scores, weather insights, NL summary |
| `packing.test.ts`        | 11    | Packing list generation for all weather conditions    |
| `health-advisor.test.ts` | 9     | Health advice rules (UV, AQI, heat, cold, rain)       |
| `validators.test.ts`     | 16    | Zod schemas for all CRUD operations                   |
| `weather-utils.test.ts`  | 14    | Formatters, wind direction, icon URLs                 |
| `api-helpers.test.ts`    | 8     | Pagination params and meta calculation                |

All tests run with **Vitest** in a jsdom environment with React Testing Library.

---

## Folder Structure

```
weda-ai/
├── prisma/
│   ├── schema.prisma            # 6-table database schema
│   └── migrations/              # Migration history
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (dashboard)/         # Weather, compare, trips, history, about
│   │   └── api/                 # 14 REST API route handlers
│   ├── features/                # 7 self-contained feature modules
│   ├── components/              # Shared UI (shadcn/ui, layout, common)
│   ├── lib/                     # Prisma, API client, Zod validators, constants
│   ├── hooks/                   # useDebounce, useGeolocation, useDeviceId
│   ├── providers/               # QueryProvider, ThemeProvider, WeatherBgProvider
│   └── types/                   # Global TypeScript types
├── tests/
│   └── unit/                    # 6 test suites, 76 tests
├── .env.example                 # Environment variable template
├── CLAUDE.md                    # Architecture reference
├── Dockerfile                   # Multi-stage production container
├── docker-compose.yml           # Local dev stack (app + PostgreSQL)
└── vercel.json                  # Vercel deployment config
```

---

## About PM Accelerator

[PM Accelerator](https://www.pmaccelerator.io/) is a professional development programme designed to help aspiring and practising product managers build the real-world skills needed to thrive in today's product landscape. Through hands-on projects, structured mentorship, and a collaborative community of ambitious professionals, the programme bridges the gap between theoretical knowledge and the practical expertise that leading companies look for.

PM Accelerator emphasises cross-functional thinking, data-driven decision making, and the ability to ship products that solve genuine user problems — not just in product management, but across engineering, design, and AI disciplines.

---

## Licence

MIT — see [LICENSE](LICENSE) for details.

---

_Wéda AI — Built with Next.js, TypeScript, and real-time data from OpenWeatherMap and Mapbox._
