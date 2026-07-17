import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { endOfMonth, format, startOfMonth } from 'date-fns'

import { getCompletedExecutionDates } from '@/api/workouts'
import { useActiveUserPrograms } from '@/hooks/use-programs'
import { useActiveChallenges } from '@/hooks/use-challenges'
import { buildTrainingCalendar, type CalendarCommitments } from '@/services/training-calendar-service'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Combined calendar commitments for the training tab: which days of the
 * given month are committed by active programs (violet) and active
 * challenges (amber), with completion state overlaid from real executions.
 */
export function useTrainingCommitments(month: Date): {
  data: CalendarCommitments
  isLoading: boolean
} {
  const user = useAuthStore((s) => s.user)
  const { data: activePrograms, isLoading: loadingPrograms } = useActiveUserPrograms()
  const { data: activeChallenges, isLoading: loadingChallenges } = useActiveChallenges()

  const sessionIds = useMemo(() => {
    const ids = new Set<string>()
    for (const p of activePrograms ?? []) {
      for (const pd of p.workout_programs.program_days) ids.add(pd.training_session_id)
    }
    for (const c of activeChallenges ?? []) {
      for (const pd of c.workout_programs.program_days) ids.add(pd.training_session_id)
    }
    return [...ids]
  }, [activePrograms, activeChallenges])

  const monthKey = format(month, 'yyyy-MM')
  const from = startOfMonth(month).toISOString()
  const to = endOfMonth(month).toISOString()

  const { data: completions, isLoading: loadingCompletions } = useQuery({
    queryKey: ['training-calendar-completions', monthKey, sessionIds.join(',')],
    queryFn: () => getCompletedExecutionDates(user!.id, sessionIds, from, to),
    enabled: !!user && sessionIds.length > 0,
  })

  const data = useMemo(() => {
    if (!activePrograms || !activeChallenges) return {}
    return buildTrainingCalendar({
      month,
      activePrograms,
      activeChallenges,
      completions: completions ?? [],
    })
  }, [month, activePrograms, activeChallenges, completions])

  return {
    data,
    isLoading: loadingPrograms || loadingChallenges || (sessionIds.length > 0 && loadingCompletions),
  }
}
