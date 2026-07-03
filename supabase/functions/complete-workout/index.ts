import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing authorization header' }, 401)
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    const { execution_id } = await req.json()
    if (!execution_id) return json({ error: 'Missing execution_id' }, 400)

    // Verify ownership and status
    const { data: execution, error: execError } = await supabaseService
      .from('workout_executions')
      .select('*')
      .eq('id', execution_id)
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .single()

    if (execError || !execution) return json({ error: 'Workout execution not found or already completed' }, 404)

    const completedAt = new Date().toISOString()
    const durationSeconds = Math.round(
      (new Date(completedAt).getTime() - new Date(execution.started_at).getTime()) / 1000
    )

    // Fetch all sets for this execution to calculate weight lifted
    const { data: sets } = await supabaseService
      .from('workout_sets')
      .select('weight, reps, workout_exercise_execution_id, workout_exercise_executions!inner(workout_execution_id)')
      .eq('workout_exercise_executions.workout_execution_id', execution_id)

    const weightLifted = (sets ?? []).reduce((sum, s) => {
      if (s.weight != null && s.reps != null) return sum + s.weight * s.reps
      return sum
    }, 0)

    // Update workout_execution
    await supabaseService
      .from('workout_executions')
      .update({ status: 'completed', completed_at: completedAt, duration_seconds: durationSeconds })
      .eq('id', execution_id)

    // Fetch current stats
    const { data: currentStats } = await supabaseService
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Streak calculation
    const { data: lastWorkout } = await supabaseService
      .from('workout_executions')
      .select('completed_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .neq('id', execution_id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let newStreak = 1
    if (lastWorkout) {
      const lastDate = new Date(lastWorkout.completed_at)
      lastDate.setHours(0, 0, 0, 0)

      if (lastDate.getTime() === yesterday.getTime()) {
        newStreak = (currentStats?.current_streak ?? 0) + 1
      } else if (lastDate.getTime() === today.getTime()) {
        newStreak = currentStats?.current_streak ?? 1
      }
    }

    const newBestStreak = Math.max(newStreak, currentStats?.best_streak ?? 0)

    // Update user_stats (service_role required)
    await supabaseService
      .from('user_stats')
      .update({
        total_workouts: (currentStats?.total_workouts ?? 0) + 1,
        total_training_seconds: (currentStats?.total_training_seconds ?? 0) + durationSeconds,
        total_weight_lifted: (currentStats?.total_weight_lifted ?? 0) + weightLifted,
        current_streak: newStreak,
        best_streak: newBestStreak,
      })
      .eq('user_id', user.id)

    // Mark calendar_event as completed if one exists for today
    const todayStr = today.toISOString().split('T')[0]
    await supabaseService
      .from('calendar_events')
      .update({ status: 'completed' })
      .eq('user_id', user.id)
      .eq('training_session_id', execution.training_session_id)
      .eq('scheduled_date', todayStr)
      .eq('status', 'scheduled')

    // Process achievements asynchronously
    await supabaseService.functions.invoke('process-achievements', {
      body: { user_id: user.id },
    })

    return json({
      success: true,
      data: {
        duration_seconds: durationSeconds,
        weight_lifted: weightLifted,
        current_streak: newStreak,
        best_streak: newBestStreak,
      },
    })
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
