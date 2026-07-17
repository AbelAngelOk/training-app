import { supabase } from '@/lib/supabase'
import type { CalendarEventRow } from '@/types/database'

export type CalendarEventWithSession = CalendarEventRow & {
  training_sessions: { id: string; name: string; estimated_duration_minutes: number | null }
}

export async function getCalendarEvents(
  userId: string,
  from: string,
  to: string
): Promise<CalendarEventWithSession[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*, training_sessions ( id, name, estimated_duration_minutes )')
    .eq('user_id', userId)
    .gte('scheduled_date', from)
    .lte('scheduled_date', to)
    .order('scheduled_date')
  if (error) throw error
  return data as unknown as CalendarEventWithSession[]
}
