export const QUERY_KEYS = {
  USER: ['user'] as const,
  USER_PROFILE: ['user-profile'] as const,
  USER_STATS: ['user-stats'] as const,
  USER_SUBSCRIPTION: ['user-subscription'] as const,

  PROGRAMS: ['programs'] as const,
  PROGRAM: (id: string) => ['programs', id] as const,
  PROGRAMS_PAGE: (search: string) => ['programs-page', search] as const,
  USER_PROGRAM: ['user-program'] as const,
  USER_PROGRAMS: ['user-programs'] as const,

  CHALLENGES: ['challenges'] as const,
  CHALLENGE: (id: string) => ['challenges', id] as const,
  CHALLENGES_PAGE: (search: string) => ['challenges-page', search] as const,
  ACTIVE_CHALLENGES: ['active-challenges'] as const,

  SESSIONS: ['sessions'] as const,
  SESSION: (id: string) => ['sessions', id] as const,

  EXERCISES: ['exercises'] as const,
  EXERCISE: (id: string) => ['exercises', id] as const,
  MUSCLE_GROUPS: ['muscle-groups'] as const,
  EQUIPMENT: ['equipment'] as const,

  WORKOUTS: ['workouts'] as const,
  WORKOUT: (id: string) => ['workouts', id] as const,
  WORKOUT_HISTORY: ['workout-history'] as const,
  SESSION_HISTORY: (sessionId: string) => ['session-history', sessionId] as const,

  CALENDAR: (month: string) => ['calendar', month] as const,

  RANKINGS: ['rankings'] as const,
  RANKING: (type: string, scope: string) => ['rankings', type, scope] as const,

  FRIENDS: ['friends'] as const,
  FRIEND_REQUESTS: ['friend-requests'] as const,

  ACHIEVEMENTS: ['achievements'] as const,
  USER_ACHIEVEMENTS: ['user-achievements'] as const,
} as const
