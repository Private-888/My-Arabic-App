# Setup Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account and project

## Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   The `.env.local` file is already configured with your Supabase credentials. If you need to update them:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   SUPABASE_SECRET_KEY=your-secret-key
   ```

3. **Run Database Migration**
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run the migration
   - This creates all tables, indexes, triggers, and RLS policies

4. **Configure Supabase Auth Redirects**
   - Go to Authentication → URL Configuration
   - Add redirect URL: `http://localhost:3000/auth/callback`
   - Add site URL: `http://localhost:3000`

5. **Create PWA Icons**
   - Create `public/icon-192.png` (192x192 pixels)
   - Create `public/icon-512.png` (512x512 pixels)
   - See `ICONS_README.md` for details

## Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First Use

1. Sign up/Login with email (magic link)
2. Import your vocabulary CSV (see Import/Export page)
3. Start your first practice session!

## Project Structure

```
/app
  /(auth)        - Authentication pages
  /(tabs)        - Main app pages (home, practice, courses, profile)
  /api           - API routes
  /session       - Learning session flow
  /word-bank     - Vocabulary management
  /import-export  - CSV import/export

/components
  /ui            - Reusable UI components
  /navigation    - Bottom nav, FAB
  /session       - Session card components
  /word-bank     - Word management components
  /auth          - Auth components

/lib
  /supabase      - Supabase client setup
  /srs           - Spaced repetition engine
  /session       - Session queue building
  /actions       - Server actions
  /stats         - Stats calculations
```

## Key Features Implemented

✅ Authentication (Supabase Auth)
✅ Database schema with RLS
✅ Spaced Repetition Engine (SM-2-lite)
✅ Daily session queue generator
✅ Review submission with XP/streak tracking
✅ Word bank with CRUD operations
✅ CSV import/export
✅ Home dashboard with stats
✅ Practice hub
✅ Courses system (UI ready)
✅ Profile page
✅ Bottom navigation + FAB
✅ PWA manifest

## Next Steps (Optional Enhancements)

- Mini games (Word Match, Quick Tap, Memory Flip)
- Speak mode
- Scenario practice flows
- Course content creation UI
- Offline session sync
- Audio pronunciation

## Troubleshooting

**Database errors**: Make sure you've run the migration SQL in Supabase
**Auth redirect errors**: Check Supabase redirect URLs configuration
**Import errors**: Ensure CSV has required columns (Category, Term, Arabic, Meaning)

