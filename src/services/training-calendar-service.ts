import { addDays, eachDayOfInterval, endOfMonth, format, isBefore, startOfDay, startOfMonth } from 'date-fns'

import type { ActiveProgram } from '@/api/programs'
import type { ActiveChallenge } from '@/api/challenges'
import { JS_DAY_TO_WEEKDAY } from '@/constants/weekday'

export interface DayCommitment {
  program?: boolean
  programCompleted?: boolean
  challenge?: boolean
  challengeCompleted?: boolean
}

/** Map of 'yyyy-MM-dd' -> commitment flags for the displayed month */
export type CalendarCommitments = Record<string, DayCommitment>

interface BuildTrainingCalendarParams {
  month: Date
  activePrograms: ActiveProgram[]
  activeChallenges: ActiveChallenge[]
  completions: { training_session_id: string; completed_at: string }[]
}

/**
 * Projects which days of the displayed month are committed by active
 * programs (weekly recurrence from program_days.weekday) and active
 * challenges (assigned_at + day_number - 1), then overlays real completed
 * executions to mark each dot as done vs. pending.
 */
export function buildTrainingCalendar({
  month,
  activePrograms,
  activeChallenges,
  completions,
}: BuildTrainingCalendarParams): CalendarCommitments {
  const completedDatesBySession = new Map<string, Set<string>>()
  for (const completion of completions) {
    const dateKey = format(new Date(completion.completed_at), 'yyyy-MM-dd')
    const set = completedDatesBySession.get(completion.training_session_id) ?? new Set<string>()
    set.add(dateKey)
    completedDatesBySession.set(completion.training_session_id, set)
  }

  const isSessionCompletedOn = (sessionId: string, dateKey: string) =>
    completedDatesBySession.get(sessionId)?.has(dateKey) ?? false

  const commitments: CalendarCommitments = {}
  const monthDays = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })

  for (const assignment of activePrograms) {
    const assignedFrom = startOfDay(new Date(assignment.assigned_at))
    const programDays = assignment.workout_programs.program_days ?? []

    for (const day of monthDays) {
      if (isBefore(day, assignedFrom)) continue

      const weekday = JS_DAY_TO_WEEKDAY[day.getDay()]
      const match = programDays.find((pd) => pd.weekday === weekday)
      if (!match) continue

      const dateKey = format(day, 'yyyy-MM-dd')
      const entry = commitments[dateKey] ?? {}
      entry.program = true
      if (isSessionCompletedOn(match.training_session_id, dateKey)) {
        entry.programCompleted = true
      }
      commitments[dateKey] = entry
    }
  }

  for (const assignment of activeChallenges) {
    const startDate = startOfDay(new Date(assignment.assigned_at))
    const challengeDays = assignment.workout_programs.program_days ?? []

    for (const day of challengeDays) {
      const date = addDays(startDate, day.day_number - 1)
      if (date < startOfMonth(month) || date > endOfMonth(month)) continue

      const dateKey = format(date, 'yyyy-MM-dd')
      const entry = commitments[dateKey] ?? {}
      entry.challenge = true
      if (isSessionCompletedOn(day.training_session_id, dateKey)) {
        entry.challengeCompleted = true
      }
      commitments[dateKey] = entry
    }
  }

  return commitments
}
