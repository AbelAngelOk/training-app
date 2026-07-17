import type { ExerciseRow } from './database'

export type DayCode = 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D'
export type SessionStatus = 'pending' | 'completed' | 'late' | 'incomplete'

export interface WorkoutSet {
  id: string
  weight: number
  reps: number
  completed: boolean
  /** 1-based position of the set; mirrors workout_sets.set_number */
  setNumber?: number
  /** workout_sets.id once the set has been logged to the database */
  dbId?: string
}

/** One exercise inside an in-progress guided workout execution */
export interface ExecutionExercise {
  sessionExerciseId: string
  exerciseExecutionId: string | null
  name: string
  muscleGroup: string
  targetSets: number
  targetReps: number
  targetWeight: number | null
  restSeconds: number
  exercise: ExerciseRow
  sets: WorkoutSet[]
}

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  targetSets: number
  targetReps: number
  restSeconds: number
  lastWeight: number
  lastReps: number
  sets: WorkoutSet[]
}

export interface Session {
  id: string
  name: string
  muscleGroup: string
  dayCode: DayCode
  icon: string
  estimatedMinutes: number
  exercises: Exercise[]
  exerciseCount?: number
  status: SessionStatus
  scheduledDate: Date
}

export interface Program {
  id: string
  name: string
  description: string
  color: string
  icon: string
  weeklyDays: DayCode[]
  weeklyProgress: number
  sessionsCompleted: number
  sessionsTotal: number
  status: 'active' | 'paused' | 'completed'
  sessions: Session[]
}
