import { create } from 'zustand'

/**
 * Ephemeral UI state for the workout execution in progress.
 * The database is the source of truth for logged sets (workout_sets rows are
 * written incrementally via logSet), so the app can resume an in-progress
 * workout after a crash by rehydrating from getActiveWorkout().
 */
interface ActiveWorkoutState {
  executionId: string | null
  sessionId: string | null
  programId: string | null
  /** ISO timestamp from workout_executions.started_at; elapsed time is derived from it */
  startedAt: string | null
  currentIndex: number
  /** session_exercise_id -> workout_exercise_execution_id */
  exerciseExecutionIds: Record<string, string>
  /** Epoch ms deadline of the running rest timer, null when no rest is active */
  restEndsAt: number | null

  begin: (payload: {
    executionId: string
    sessionId: string
    programId: string | null
    startedAt: string
    exerciseExecutionIds: Record<string, string>
  }) => void
  setCurrentIndex: (index: number) => void
  startRest: (seconds: number) => void
  clearRest: () => void
  reset: () => void
}

const initialState = {
  executionId: null,
  sessionId: null,
  programId: null,
  startedAt: null,
  currentIndex: 0,
  exerciseExecutionIds: {},
  restEndsAt: null,
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set) => ({
  ...initialState,

  begin: ({ executionId, sessionId, programId, startedAt, exerciseExecutionIds }) =>
    set({
      executionId,
      sessionId,
      programId,
      startedAt,
      exerciseExecutionIds,
      currentIndex: 0,
      restEndsAt: null,
    }),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  startRest: (seconds) => set({ restEndsAt: Date.now() + seconds * 1000 }),

  clearRest: () => set({ restEndsAt: null }),

  reset: () => set(initialState),
}))
