/**
 * Exercise Video API
 * Fetches video URL from ExerciseDB API using external_id
 * Videos are fetched on-demand when user starts an exercise
 */

const EXERCISE_API_BASE = 'https://exercisedb.p.rapidapi.com'

interface ExerciseDBExercise {
  id: string
  name: string
  videoUrl: string
  [key: string]: any
}

interface VideoResult {
  videoUrl: string | null
  error?: string
}

/**
 * Fetch video URL for an exercise from ExerciseDB API
 * This is called in real-time when user starts the exercise
 * If API fails, returns null gracefully so exercise can continue with instructions
 */
export async function getExerciseVideo(externalId: string): Promise<VideoResult> {
  if (!externalId) {
    return { videoUrl: null, error: 'No external_id provided' }
  }

  try {
    const rapidApiKey = process.env.EXPO_PUBLIC_RAPID_API_KEY
    const rapidApiHost = 'exercisedb.p.rapidapi.com'

    if (!rapidApiKey) {
      console.warn('EXPO_PUBLIC_RAPID_API_KEY not configured')
      return { videoUrl: null, error: 'API key not configured' }
    }

    const url = `${EXERCISE_API_BASE}/exercises/exercise/${externalId}`

    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost,
      },
    })

    if (!response.ok) {
      // API error - but don't fail the exercise, just log it
      console.warn(`ExerciseDB API error for ${externalId}: ${response.status}`)
      return { videoUrl: null, error: `API returned ${response.status}` }
    }

    const data = (await response.json()) as ExerciseDBExercise

    // ExerciseDB returns the URL, might be null
    const videoUrl = data.videoUrl || null

    return { videoUrl }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.warn(`Failed to fetch exercise video for ${externalId}: ${message}`)

    // Network error or parsing error - return gracefully
    return {
      videoUrl: null,
      error: message,
    }
  }
}

/**
 * Batch fetch videos for multiple exercises
 * Useful for pre-loading at session start
 */
export async function getExerciseVideos(
  externalIds: string[]
): Promise<Record<string, VideoResult>> {
  const results: Record<string, VideoResult> = {}

  // Fetch sequentially to avoid rate limiting
  for (const id of externalIds) {
    results[id] = await getExerciseVideo(id)
    // Small delay between requests to be respectful to the API
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return results
}
