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

    // Process stat-based achievements asynchronously
    await supabaseService.functions.invoke('process-achievements', {
      body: { user_id: user.id },
    })

    // If this session is a day of an active challenge, check whether all its
    // days are now completed and unlock the challenge's achievement.
    await maybeCompleteChallenge(supabaseService, user.id, execution.training_session_id)

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

/**
 * Challenges reuse training_sessions/program_days (type='challenge', day_number
 * instead of weekday). If the just-completed session belongs to an active
 * challenge of this user, count how many distinct challenge days already have
 * a completed execution; once every day is covered, unlock the challenge's
 * achievement and stamp user_programs.completed_at.
 */
async function maybeCompleteChallenge(
  supabaseService: ReturnType<typeof createClient>,
  userId: string,
  trainingSessionId: string
) {
  const { data: day } = await supabaseService
    .from('program_days')
    .select('workout_program_id, workout_programs!inner(id, duration_days, achievement_id, type)')
    .eq('training_session_id', trainingSessionId)
    .eq('workout_programs.type', 'challenge')
    .maybeSingle()

  if (!day) return

  const challenge = (day as any).workout_programs
  if (!challenge?.duration_days || !challenge?.achievement_id) return

  const { data: userProgram } = await supabaseService
    .from('user_programs')
    .select('id')
    .eq('user_id', userId)
    .eq('workout_program_id', challenge.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!userProgram) return

  const { data: challengeDays } = await supabaseService
    .from('program_days')
    .select('training_session_id')
    .eq('workout_program_id', challenge.id)

  const sessionIds = (challengeDays ?? []).map((d) => d.training_session_id)
  if (sessionIds.length === 0) return

  const { data: completions } = await supabaseService
    .from('workout_executions')
    .select('training_session_id')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .in('training_session_id', sessionIds)

  const completedSessionIds = new Set((completions ?? []).map((c) => c.training_session_id))
  if (completedSessionIds.size < challenge.duration_days) return

  await supabaseService
    .from('user_achievements')
    .upsert(
      { user_id: userId, achievement_id: challenge.achievement_id, unlocked_at: new Date().toISOString() },
      { onConflict: 'user_id,achievement_id', ignoreDuplicates: true }
    )

  await supabaseService
    .from('user_programs')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', userProgram.id)
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
