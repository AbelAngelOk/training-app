import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WEEKDAY_MAP: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
}

// Generates calendar events for the next N days based on active user programs
// Intended to run as a scheduled job (e.g., daily via Supabase Cron)
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const daysAhead = 14

    // Fetch all active user programs with their days
    const { data: userPrograms, error: programsError } = await supabaseService
      .from('user_programs')
      .select(`
        user_id,
        workout_programs (
          program_days ( weekday, training_session_id )
        )
      `)

    if (programsError) throw programsError

    const events: {
      user_id: string
      training_session_id: string
      scheduled_date: string
      status: 'scheduled'
    }[] = []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const up of userPrograms ?? []) {
      const program = Array.isArray(up.workout_programs) ? up.workout_programs[0] : up.workout_programs
      const programDays = program?.program_days ?? []

      for (let i = 0; i < daysAhead; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() + i)
        const weekday = WEEKDAY_MAP[date.getDay()]
        const dateStr = date.toISOString().split('T')[0]

        const day = programDays.find((d: { weekday: string }) => d.weekday === weekday)
        if (!day) continue

        events.push({
          user_id: up.user_id,
          training_session_id: day.training_session_id,
          scheduled_date: dateStr,
          status: 'scheduled',
        })
      }
    }

    if (events.length === 0) {
      return json({ success: true, data: { created: 0 } })
    }

    // Insert only events that don't already exist
    const { error: insertError } = await supabaseService
      .from('calendar_events')
      .upsert(events, { onConflict: 'user_id,training_session_id,scheduled_date', ignoreDuplicates: true })

    if (insertError) throw insertError

    return json({ success: true, data: { created: events.length } })
  } catch (error) {
    return json({ error: error.message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
