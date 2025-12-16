# My Arabic App

Personal Arabic Learning PWA - A Supabase-first progressive web application for learning Palestinian Arabic through spaced repetition and structured practice.

## Features

- Personal vocabulary database
- Spaced repetition system (SM-2 algorithm)
- Daily learning sessions
- Courses and lessons
- Scenario-based practice
- Mini games
- Speak mode
- Import/Export CSV
- PWA support (offline-ready, installable)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Supabase (Postgres, Auth, Storage)
- PWA capabilities

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (`.env.local` is already configured)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key
- `SUPABASE_SECRET_KEY` - Supabase secret key (server-only)

