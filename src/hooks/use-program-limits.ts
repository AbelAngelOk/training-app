import { useIsPremium } from '@/hooks/use-subscriptions'
import { useUserProgramAssignments } from '@/hooks/use-programs'

export type ProgramKind = 'program' | 'challenge'

const FREE_LIMIT = 1
const PREMIUM_LIMIT = 3

/**
 * Client-side view of the per-plan active program/challenge limits
 * (free: 1 + 1, premium: 3 + 3). Used for UX (disable buttons, show notices);
 * the DB trigger check_user_program_limit is the hard guarantee.
 */
export function useProgramLimits(kind: ProgramKind = 'program') {
  const isPremium = useIsPremium()
  const { data: assignments, isLoading } = useUserProgramAssignments()

  const activeCount = (assignments ?? []).filter((assignment) => {
    if (!assignment.is_active) return false
    const isChallenge = (assignment.workout_programs.type as string) === 'challenge'
    return (kind === 'challenge') === isChallenge
  }).length

  const maxAllowed = isPremium ? PREMIUM_LIMIT : FREE_LIMIT

  return {
    activeCount,
    maxAllowed,
    canActivate: activeCount < maxAllowed,
    isPremium,
    isLoading,
  }
}
