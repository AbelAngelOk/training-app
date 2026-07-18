# ExerciseDB Integration Setup

> **Scope note**: ExerciseDB is used **only** to import the exercise **catalog** (name, instructions, tips, image, muscle group, equipment) via `seed:exercises`. Visual display of exercises (GIFs) is handled separately by a different API — see [EXERCISE_GIF_ARCHITECTURE.md](./EXERCISE_GIF_ARCHITECTURE.md). `RAPID_API_KEY` below is only needed by the Node seed script, never at runtime.

## Overview

This guide explains how to set up ExerciseDB API integration for importing exercise catalog data.

## Architecture Summary

- **Data Storage**: Exercise metadata (name, instructions, tips, image) stored in Supabase `exercises` table
- **One-time import**: `npm run seed:exercises` pulls the catalog from ExerciseDB and stores it locally; nothing is fetched from ExerciseDB again afterward

## Prerequisites

1. **RapidAPI Account** (free tier available)
   - Sign up: https://rapidapi.com
   - Subscribe to ExerciseDB: https://rapidapi.com/justin-WFnsXH_haHLw/api/exercisedb
   - Copy your API key from dashboard

2. **Environment Variable** set in `.env` (for the seed script only — not needed at runtime)

## Setup Steps

### 1. Apply Database Migrations

Deploy pending migrations to Supabase:

```bash
# Link your Supabase project
npx supabase link --project-ref your_project_ref

# Push migrations
npx supabase db push
```

Migrations to deploy:
- `20260615000002_add_unique_user_programs.sql`
- `20260615000003_add_external_id_to_exercises.sql`

### 2. Set Up RapidAPI Key

Get your API key:
1. Visit https://rapidapi.com/justin-WFnsXH_haHLw/api/exercisedb
2. Click "Subscribe to Test"
3. Copy your API key

Add to `.env`:
```bash
RAPID_API_KEY=your_api_key_here
```

### 3. Run Import Script

```bash
# Install dependencies if needed
npm install

# Run the seed script
npm run seed:exercises
```

**First run**: Imports ~1500+ exercises (may take 2-3 minutes)
**Subsequent runs**: Only imports new exercises (has `external_id` deduplication)

Script logs:
```
Starting exercise import from ExerciseDB API...

Found 12 muscle groups

Fetching exercises for muscle: chest
  Found 45 exercises
  ✓ Imported 10 exercises...
  ✓ Completed chest

...

========================================
Import complete!
Total imported: 1500
Total skipped: 50
========================================
```

## Database Schema

### exercises table changes

**ADDED:**
```sql
external_id text UNIQUE   -- ExerciseDB exerciseId (catalog import reference only)
tips text                 -- Exercise tips/cues
```

**REMOVED:**
```sql
video_url text             -- Never used; exercise visuals are fetched on demand (see EXERCISE_GIF_ARCHITECTURE.md)
```

**Example row:**
```json
{
  "id": "uuid-123",
  "name": "Bench Press",
  "description": "Músculos: chest, triceps",
  "instructions": "1. Lie on flat bench\n2. Grip bar...",
  "tips": "Keep elbows tucked\nFull range of motion",
  "image_url": "https://...",
  "external_id": "3102",
  "fitgifs_slug": "barbell-bench-press",
  "muscle_group_id": "uuid-chest",
  "equipment_id": "uuid-barbell",
  "difficulty": "intermediate"
}
```

## API Rate Limits

Free tier: 100 requests per day

Optimization:
- Batch import only runs once
- If you need to re-import frequently, consider the paid tier (unlimited requests)

## Troubleshooting

### "Missing RAPID_API_KEY"
Solution: Add `RAPID_API_KEY=...` to `.env` file

### "API Error: 429 Too Many Requests"
Solution: Wait 24 hours (free tier limit), or upgrade to paid plan

### Exercise metadata looks incomplete
- Some exercises may have been removed or changed in ExerciseDB since the last import
- Rerun `npm run seed:exercises` to pick up new ones (existing rows are deduplicated by `external_id`)

## Future Enhancements

1. **Cron Job**: Auto-sync new exercises daily
2. **Analytics**: Track which exercises are viewed most

## References

- ExerciseDB API: https://github.com/ExerciseDB/exercisedb-api
- RapidAPI Dashboard: https://rapidapi.com/dashboard
- GIF display architecture: [EXERCISE_GIF_ARCHITECTURE.md](./EXERCISE_GIF_ARCHITECTURE.md)
