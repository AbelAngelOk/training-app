import { supabase } from '@/lib/supabase'

export interface CompleteWorkoutResult {
  duration_seconds: number
  weight_lifted: number
  current_streak: number
  best_streak: number
}

export async function completeWorkoutWithStats(
  executionId: string
): Promise<CompleteWorkoutResult> {
  const { data, error } = await supabase.functions.invoke('complete-workout', {
    body: { execution_id: executionId },
  })

  if (error) throw error
  if (!data.success) throw new Error(data.error ?? 'Failed to complete workout')

  return data.data as CompleteWorkoutResult
}
