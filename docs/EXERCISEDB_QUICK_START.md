# ExerciseDB Quick Start

## TL;DR

1. Get API key: https://rapidapi.com/justin-WFnsXH_haHLw/api/exercisedb
2. Set `RAPID_API_KEY` in `.env`
3. Set `EXPO_PUBLIC_RAPID_API_KEY` in `app.json`
4. Deploy migrations: `npx supabase db push`
5. Seed exercises: `npm run seed:exercises`
6. Use in components with `useExerciseVideo` hook

## Code Examples

### 1. Using Exercise Video Hook

```typescript
import { useExerciseVideo } from '@/hooks/use-exercise-video'

export function ExerciseScreen({ exercise }: { exercise: ExerciseRow }) {
  const { data: videoData, isLoading, error } = useExerciseVideo(exercise.external_id)

  if (isLoading) return <ActivityIndicator />
  if (error) return <Text>Failed to load video</Text>
  
  // Video URL is ready or null
  if (videoData?.videoUrl) {
    return <Video source={{ uri: videoData.videoUrl }} />
  }
  
  // Fallback to instructions
  return <InstructionsView instructions={exercise.instructions} />
}
```

### 2. Batch Loading Videos

```typescript
import { getExerciseVideos } from '@/api/exercise-video'

const exercises = await fetchExercises()
const externalIds = exercises
  .map(e => e.external_id)
  .filter(Boolean)

const videosMap = await getExerciseVideos(externalIds)

// Use videos in loop
exercises.forEach(exercise => {
  const video = videosMap[exercise.external_id]
  console.log(video.videoUrl || 'Use instructions instead')
})
```

### 3. Pre-fetching on Component Mount

```typescript
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useExerciseVideo } from '@/hooks/use-exercise-video'

export function SessionList({ exercises }: { exercises: ExerciseRow[] }) {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Pre-fetch all videos in the background
    exercises.forEach(ex => {
      queryClient.prefetchQuery({
        queryKey: ['exercise', 'video', ex.external_id],
        queryFn: () => getExerciseVideo(ex.external_id),
      })
    })
  }, [exercises, queryClient])

  return (
    <FlatList
      data={exercises}
      renderItem={({ item }) => <ExerciseCard exercise={item} />}
    />
  )
}
```

### 4. Display with ExerciseVideoDisplay Component

```typescript
import { ExerciseVideoDisplay } from '@/components/training/ExerciseVideoDisplay'

export function ExerciseDetail({ exercise }: { exercise: ExerciseRow }) {
  return (
    <View>
      <ExerciseVideoDisplay
        exercise={exercise}
        showInstructions={true}
      />
    </View>
  )
}
```

### 5. Handle Video Errors in Custom Component

```typescript
export function CustomExercisePlayer({ exercise }: { exercise: ExerciseRow }) {
  const { data, isLoading, error } = useExerciseVideo(exercise.external_id)

  return (
    <View>
      {isLoading && <LoadingIndicator />}

      {data?.videoUrl && (
        <Video
          source={{ uri: data.videoUrl }}
          onError={(err) => {
            console.error('Video playback error:', err)
            // Video player error, but component doesn't crash
          }}
        />
      )}

      {error || !data?.videoUrl ? (
        <View style={styles.fallback}>
          {error && (
            <Text style={styles.errorText}>
              Video unavailable. Showing instructions instead.
            </Text>
          )}
          <InstructionsView
            instructions={exercise.instructions}
            tips={exercise.tips}
          />
        </View>
      ) : null}
    </View>
  )
}
```

## Environment Setup

### `.env` (Local Development)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RAPID_API_KEY=your-rapidapi-key
```

### `app.json` (Production)

```json
{
  "expo": {
    "name": "training-app",
    "slug": "training-app",
    "extra": {
      "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
      "EXPO_PUBLIC_RAPID_API_KEY": "your-rapidapi-key"
    }
  }
}
```

## Deployment Checklist

- [ ] RapidAPI key obtained and added to `.env`
- [ ] Migrations deployed: `npx supabase db push`
- [ ] Seed script run: `npm run seed:exercises`
- [ ] `app.json` updated with `EXPO_PUBLIC_RAPID_API_KEY`
- [ ] `ExerciseVideoDisplay` component integrated in exercise screens
- [ ] Video loading states added to UI
- [ ] Error handling tested (simulate API down)
- [ ] Fallback to instructions working correctly
- [ ] Video player performance tested on low bandwidth

## API Rate Limits

**Free Tier**: 100 requests/day
**Paid Tier**: Unlimited (recommended for production)

To upgrade:
1. Visit https://rapidapi.com/dashboard
2. Find ExerciseDB API
3. Choose pricing plan
4. Update API key

## Troubleshooting

### Videos not loading?

```bash
# Check API key is set
echo $RAPID_API_KEY
echo $EXPO_PUBLIC_RAPID_API_KEY

# Check rate limit not exceeded
# (Free tier: 100 requests/day)

# Test API manually
curl -H "x-rapidapi-key: $RAPID_API_KEY" \
  "https://exercisedb.p.rapidapi.com/v2/exercises/id/3102"
```

### Exercises table schema error?

```bash
# Check migration was applied
npx supabase db pull

# If missing, push migrations manually
npx supabase db push
```

### Seed script fails?

```bash
# Check Supabase credentials
echo $EXPO_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Run with debug logging
DEBUG=* npm run seed:exercises

# Check specific exercise in API
curl -H "x-rapidapi-key: $RAPID_API_KEY" \
  "https://exercisedb.p.rapidapi.com/v2/exercises/muscle/chest?limit=10"
```

## Performance Tips

1. **Cache**: React Query caches videos for 1 hour
2. **Prefetch**: Load all videos when session starts
3. **Lazy Load**: Only fetch when user opens exercise
4. **Retry**: Automatically retries once on failure
5. **Fallback**: Instructions always available as backup

## Next Steps

1. Read [EXERCISE_VIDEO_ARCHITECTURE.md](./EXERCISE_VIDEO_ARCHITECTURE.md) for full details
2. Review [EXERCISEDB_SETUP.md](./EXERCISEDB_SETUP.md) for complete setup
3. Check example component: `src/components/training/ExerciseVideoDisplay.tsx`
4. Integrate into your exercise screens
