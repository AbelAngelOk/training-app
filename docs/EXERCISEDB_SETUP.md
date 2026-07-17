# ExerciseDB Integration Setup

## Overview

This guide explains how to set up ExerciseDB API integration for exercise data and videos.

## Architecture Summary

- **Data Storage**: Exercise metadata (name, instructions, tips, image) stored in Supabase `exercises` table
- **Video Streaming**: Videos fetched on-demand from ExerciseDB API using `external_id` reference
- **Graceful Fallback**: If API unavailable, exercises show instructions/tips instead of video

## Prerequisites

1. **RapidAPI Account** (free tier available)
   - Sign up: https://rapidapi.com
   - Subscribe to ExerciseDB: https://rapidapi.com/justin-WFnsXH_haHLw/api/exercisedb
   - Copy your API key from dashboard

2. **Environment Variables** set in:
   - `.env` file (for local seed script)
   - `app.json` `expo.extra` (for runtime)

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

### 4. Configure Runtime API Key

Add to `app.json`:

```json
{
  "expo": {
    "name": "training-app",
    "extra": {
      "EXPO_PUBLIC_SUPABASE_URL": "...",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "...",
      "EXPO_PUBLIC_RAPID_API_KEY": "your_api_key_here"
    }
  }
}
```

Or via `.env` for development (Expo reads `EXPO_PUBLIC_*` variables):

```bash
EXPO_PUBLIC_RAPID_API_KEY=your_api_key_here
```

### 5. Update package.json Scripts

Add seed script to `package.json`:

```json
{
  "scripts": {
    "start": "expo start",
    "build": "eas build",
    "seed:exercises": "node scripts/seed-exercises-from-api.js"
  }
}
```

## Usage in Components

### Fetch Video for Single Exercise

```typescript
import { useExerciseVideo } from '@/hooks/use-exercise-video'

export function ExerciseDetail({ exercise }) {
  const { data: videoData, isLoading } = useExerciseVideo(exercise.external_id)

  return (
    <>
      {videoData?.videoUrl ? (
        <Video source={{ uri: videoData.videoUrl }} />
      ) : (
        <InstructionsText>{exercise.instructions}</InstructionsText>
      )}
    </>
  )
}
```

### Batch Fetch Videos

```typescript
import { getExerciseVideos } from '@/api/exercise-video'

const externalIds = exercises.map(e => e.external_id).filter(Boolean)
const videos = await getExerciseVideos(externalIds)
```

## Database Schema

### exercises table changes

**ADDED:**
```sql
external_id text UNIQUE NOT NULL  -- ExerciseDB exerciseId
tips text                         -- Exercise tips/cues
```

**REMOVED:**
```sql
video_url text                    -- Videos fetched on-demand instead
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
  "muscle_group_id": "uuid-chest",
  "equipment_id": "uuid-barbell",
  "difficulty": "intermediate"
}
```

## API Rate Limits

Free tier: 100 requests per day

Optimization:
- Videos cached by React Query for 1 hour
- Batch import only runs once
- Production should use paid tier (unlimited requests)

## Troubleshooting

### "Missing RAPID_API_KEY"
Solution: Add `RAPID_API_KEY=...` to `.env` file

### "API Error: 429 Too Many Requests"
Solution: Wait 24 hours (free tier limit), or upgrade to paid plan

### "Exercise not found in ExerciseDB"
- Some exercises may have been removed from ExerciseDB
- Video fetch fails gracefully, exercise continues with instructions
- Check logs for specific exercise ID

### "Video URL is null"
- ExerciseDB may not have video for that exercise
- Check ExerciseDB directly: https://exercisedb.p.rapidapi.com/v2/exercises/id/{externalId}
- Fallback to instructions is working as designed

## Future Enhancements

1. **Cron Job**: Auto-sync new exercises daily
2. **CDN**: Cache video URLs in Redis
3. **Fallback Videos**: Host S3 backups of popular videos
4. **Analytics**: Track which videos are viewed most
5. **Local Storage**: Download videos for offline use

## References

- ExerciseDB API: https://github.com/ExerciseDB/exercisedb-api
- RapidAPI Dashboard: https://rapidapi.com/dashboard
- Docs: [EXERCISE_VIDEO_ARCHITECTURE.md](./EXERCISE_VIDEO_ARCHITECTURE.md)
