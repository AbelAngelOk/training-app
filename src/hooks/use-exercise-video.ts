import { useQuery } from '@tanstack/react-query'
import { getExerciseVideo } from '@/api/exercise-video'

const QUERY_KEYS = {
  exerciseVideo: (externalId: string) => ['exercise', 'video', externalId],
}

interface UseExerciseVideoOptions {
  enabled?: boolean
}

/**
 * Hook to fetch exercise video URL on-demand
 * Videos are streamed directly from ExerciseDB API
 * Gracefully handles API failures without breaking the exercise flow
 */
export function useExerciseVideo(externalId: string | null, options: UseExerciseVideoOptions = {}) {
  const { enabled = !!externalId } = options

  return useQuery({
    queryKey: QUERY_KEYS.exerciseVideo(externalId || ''),
    queryFn: () => getExerciseVideo(externalId!),
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour - video URL shouldn't change often
    retry: 1, // Only retry once on failure
    throwOnError: false, // Don't throw - let the component handle gracefully
  })
}
