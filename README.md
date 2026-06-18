# Vivasayi — A Farmer's Assistant

An AI-powered web app for Indian farmers, built with Next.js, Supabase, and Google Gemini (via Genkit). It helps farmers track their farms, get AI crop recommendations, detect crop disease from photos, generate a week-by-week cultivation plan, and chat with a multilingual farming assistant.

## Features

- **Farm management** — add and track multiple farms (soil type, district, topography, water source) backed by Supabase Postgres.
- **AI crop recommendations** — Gemini-generated suggestions based on soil type, district, and season.
- **Disease detection** — upload a photo of a crop and get an AI diagnosis with suggested remedies, via Gemini Vision.
- **Personalized cultivation plan** — a week-by-week plan from sowing to harvest for a given crop and district, exportable as a PDF (generated client-side from the rendered plan).
- **Multilingual chatbot** — a farming-assistant chatbot that responds in whatever language it's prompted in (Gemini's native multilingual capability), grounded in a local farming knowledge base.
- **Weather** — current weather for the farmer's primary district via OpenWeatherMap, server-side only.
- **Crop price reference** — a reference table of recent mandi (market) prices. **Not live government data** — see the disclaimer below.
- **Auth** — email/password and Google OAuth via Supabase Auth, with route-level guarding in middleware.

## What this app is *not* (yet)

Being direct about current limitations rather than overselling them:

- **Crop prices are not pulled from a live government API.** `getLatestCropPrices` (`src/services/market-service.ts`) returns a static, hardcoded reference table. Separately, the AI-flow-based market price estimate (`src/lib/market-price-flow.ts`, exposed via the `getMarketPrices` server action) asks Gemini to produce a *plausible estimate* based on its training knowledge — it is not a live quote and should be labeled as such anywhere it's shown to a user.
- **Historical crop yield data is mocked.** The crop recommendation flow uses a small hardcoded sample of district/crop yield data, not a real agricultural dataset.
- **There is no automated test suite yet.** No unit, integration, or end-to-end tests exist in this repo.
- **The 22-language UI translation files in `src/messages/` are not wired up.** They exist as content but aren't imported anywhere in the app. The chatbot's multilingual replies work independently of this and are unaffected.

## Tech stack

- **Framework:** Next.js 15 (App Router), TypeScript, React 19
- **AI:** Google Gemini via [Genkit](https://genkit.dev) (`genkit`, `@genkit-ai/googleai`)
- **Backend / Auth / DB / Storage:** Supabase (Postgres, Auth, Storage) via `@supabase/ssr` and `@supabase/supabase-js`
- **UI:** Tailwind CSS, Radix UI primitives, shadcn-style components
- **Forms & validation:** React Hook Form + Zod
- **PDF export:** `jspdf` + `html2canvas` (client-side rendering of the cultivation plan)
- **Weather:** OpenWeatherMap

## Getting started

### 1. Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com/app/apikey) API key for Gemini
- An [OpenWeatherMap](https://openweathermap.org/api) API key

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `GOOGLE_GENAI_API_KEY`, `WEATHER_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 4. Set up the Supabase database

Run `supabase/migrations.sql` in your project's SQL Editor (Dashboard → SQL Editor → New query), or via the Supabase CLI:

```bash
supabase db push
```

This creates the `farms`, `crops`, `sensor_readings`, and `cultivation_plans` tables with row-level security scoped to `auth.uid()`, plus the `vivasayi-storage` bucket for soil report uploads.

**One manual step the SQL can't do:** in the Supabase dashboard, go to **Storage → vivasayi-storage → Settings** and confirm "Public bucket" is **off**. Soil reports are private; the app reads them back via short-lived signed URLs (`src/actions/storage-actions.ts`), not public links.

### 5. Configure Google OAuth (optional, for "Sign in with Google")

In your Supabase dashboard: **Authentication → Providers → Google**, add your OAuth credentials, and set the redirect URL to `{your-app-url}/auth/callback`.

### 6. Run locally

```bash
npm run dev
```

### 7. Build for production

```bash
npm run build
npm run start
```

## Project structure

```
src/
├── ai/flows/          # Genkit flows (Gemini prompts): disease detection,
│                       crop recommendations, chatbot, cultivation plan
├── app/                # Next.js App Router pages
├── actions/            # Server actions (market prices, signed storage URLs)
├── components/features/  # Feature-level components (forms, cards, chatbot)
├── components/ui/      # Shared shadcn-style UI primitives
├── context/AuthContext.tsx  # Auth state, shared across the app
├── lib/supabase-client.ts   # Single shared Supabase browser client
├── lib/storage.ts       # File upload helper (private bucket)
├── middleware.ts        # Route guarding (redirects unauthenticated users)
└── services/            # External API calls (weather, market reference data)

supabase/
└── migrations.sql       # Database schema + RLS policies
```

## Known gaps / roadmap

- Wire up real market price data (data.gov.in or a commercial mandi-price API) instead of the static reference table and AI estimate.
- Add automated tests — none exist yet.
- Either wire up `src/messages/` for a fully translated UI, or remove it to avoid confusion.
- Replace the placeholder PWA icons in `public/icons/` with real branded artwork.
