import type { SessionExecutionHistory, SessionHistoryExecution } from '@/api/workouts'
import { WEEKDAY_TO_JS_DAY } from '@/constants/weekday'
import type { Weekday } from '@/types/database'

export type HistoryEntryStatus = 'completed' | 'cancelled' | 'in_progress' | 'completed_off_schedule'

export interface SessionHistoryEntry {
  executionId: string
  startedAt: string
  completedAt: string | null
  durationSeconds: number | null
  status: HistoryEntryStatus
  volume: number
  totalReps: number
  setsCompleted: number
  setsTarget: number
  maxWeight: number
}

function deriveStatus(
  execution: SessionHistoryExecution,
  plannedWeekday: Weekday | null
): HistoryEntryStatus {
  if (execution.status === 'cancelled') return 'cancelled'
  if (execution.status === 'in_progress') return 'in_progress'
  if (!plannedWeekday || !execution.completed_at) return 'completed'

  const completedDay = new Date(execution.completed_at).getDay()
  return completedDay === WEEKDAY_TO_JS_DAY[plannedWeekday] ? 'completed' : 'completed_off_schedule'
}

/** Pure aggregation over raw execution rows — no network calls. */
export function buildSessionHistory({
  executions,
  plannedWeekdayBySession,
}: SessionExecutionHistory): SessionHistoryEntry[] {
  return executions.map((execution) => {
    let volume = 0
    let totalReps = 0
    let setsCompleted = 0
    let setsTarget = 0
    let maxWeight = 0

    for (const exerciseExecution of execution.workout_exercise_executions) {
      setsTarget += exerciseExecution.session_exercises.target_sets ?? 0
      for (const set of exerciseExecution.workout_sets) {
        setsCompleted += 1
        const weight = Number(set.weight ?? 0)
        const reps = set.reps ?? 0
        volume += weight * reps
        totalReps += reps
        if (weight > maxWeight) maxWeight = weight
      }
    }

    return {
      executionId: execution.id,
      startedAt: execution.started_at,
      completedAt: execution.completed_at,
      durationSeconds: execution.duration_seconds,
      status: deriveStatus(execution, plannedWeekdayBySession[execution.training_session_id] ?? null),
      volume,
      totalReps,
      setsCompleted,
      setsTarget,
      maxWeight,
    }
  })
}
