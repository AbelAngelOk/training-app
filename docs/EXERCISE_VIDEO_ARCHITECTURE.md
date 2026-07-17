# Exercise Video Architecture

## Overview

Videos for exercises are fetched **on-demand** from ExerciseDB API using lazy-loading. Only the `external_id` reference is stored in the database.

## Rationale

**Storage Optimization**: Video URLs are large strings and can change. Storing references instead of URLs keeps the DB lean.

**Real-time Updates**: When ExerciseDB updates a video, users automatically get the latest version without DB migrations.

**Graceful Degradation**: If the API is unavailable, the exercise still works with instructions and tips in plain text.

## Data Flow

### 1. Initial Import (One-time)

```
ExerciseDB API
    ↓ (GET /exercises/muscle/{muscle})
[scripts/seed-exercises-from-api.js]
    ↓ (extract name, instructions, tips, external_id, image)
Supabase exercises table
    ↓ (stores external_id + metadata, NO video_url)
```

Run script:
```bash
RAPID_API_KEY=your_key npm run seed:exercises
```

### 2. Exercise Start (Runtime)

When user starts an exercise in the app:

```
src/components/ExercisePlayer.tsx
    ↓ (useExerciseVideo hook)
src/hooks/use-exercise-video.ts
    ↓ (queryFn)
src/api/exercise-video.ts
    ↓ (getExerciseVideo(external_id))
ExerciseDB API
    ↓ (GET /exercises/id/{external_id})
VideoResult { videoUrl, error? }
    ↓ (render video or fallback to instructions)
User sees video or instructions
```

## Schema Changes

### exercises table

**ADDED:**
- `external_id` (text, UNIQUE) - ExerciseDB exerciseId
- `tips` (text, Nullable) - Exercise tips/cues

**REMOVED:**
- `video_url` - No longer stored; fetched on-demand

## API Contract

### ExerciseDB Response (GET /exercises/id/{externalId})

```typescript
{
  id: string              // exerciseId (same as external_id)
  name: string
  videoUrl: string | null // Fetched on-demand
  image: string           // Exercise image
  instructions: string[]  // Array of steps
  exerciseTips: string[]  // Tips/cues
  equipment: string[]     // Equipment list
  bodyParts: string[]     // Affected body parts
  muscle: string          // Primary muscle
  difficulty: string      // beginner | intermediate | expert
}
```

## Code Locations

| File | Purpose |
|------|---------|
| `src/api/exercise-video.ts` | Core API calls to ExerciseDB |
| `src/hooks/use-exercise-video.ts` | React Query wrapper |
| `scripts/seed-exercises-from-api.js` | Initial import script |
| `supabase/migrations/20260615000003_*.sql` | Schema migration |
| `src/components/training/ExercisePlayer.tsx` | UI component using videos |

## Error Handling

### Scenarios

| Scenario | Behavior |
|----------|----------|
| API unavailable | Show instructions + tips, no video |
| Rate limited (429) | Retry once, then fallback to instructions |
| Exercise deleted from API | Show placeholder, instructions remain |
| Network timeout | Fallback to instructions with toast notification |
| Invalid external_id | Log error, exercise continues with instructions |

### Implementation

```typescript
// Component catches error gracefully
const { data, isLoading, error } = useExerciseVideo(exercise.external_id)

if (error || !data?.videoUrl) {
  return <InstructionsView instructions={exercise.instructions} tips={exercise.tips} />
}

return <VideoPlayer src={data.videoUrl} />
```

## Caching Strategy

React Query `useExerciseVideo` hook:
- **staleTime**: 1 hour (videos don't change often)
- **retry**: 1 attempt only
- **throwOnError**: false (graceful failure)

This minimizes API calls while being resilient to transient failures.

## Environment Variables

Add to `.env` (for seed script):
```
RAPID_API_KEY=your_rapidapi_key
```

Add to `app.json` (for runtime):
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_RAPID_API_KEY": "your_rapidapi_key"
    }
  }
}
```

## Getting RapidAPI Key

1. Visit https://rapidapi.com/justin-WFnsXH_haHLw/api/exercisedb
2. Sign up (free tier available)
3. Copy API key from dashboard
4. Add to environment variables

## Future Considerations

- **CDN Caching**: If ExerciseDB adds cache headers, leverage them
- **Fallback Videos**: Store S3 URLs for locally-hosted fallbacks
- **Offline Mode**: Cache videos locally when available
- **Video Format**: Consider adaptive bitrate (HLS/DASH) for slow connections
