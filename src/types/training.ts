export type DayCode = 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D'
export type SessionStatus = 'pending' | 'completed' | 'late' | 'incomplete'

export interface WorkoutSet {
  id: string
  weight: number
  reps: number
  completed: boolean
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
