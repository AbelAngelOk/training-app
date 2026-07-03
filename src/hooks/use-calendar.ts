import { useQuery } from '@tanstack/react-query'
import { endOfMonth, format, startOfMonth } from 'date-fns'

import { getCalendarEvents } from '@/api/calendar'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAuthStore } from '@/stores/auth-store'

export function useCalendarEvents(month: Date) {
  const user = useAuthStore((s) => s.user)
  const monthKey = format(month, 'yyyy-MM')
  const from = format(startOfMonth(month), 'yyyy-MM-dd')
  const to = format(endOfMonth(month), 'yyyy-MM-dd')

  return useQuery({
    queryKey: QUERY_KEYS.CALENDAR(monthKey),
    queryFn: () => getCalendarEvents(user!.id, from, to),
    enabled: !!user,
  })
}
