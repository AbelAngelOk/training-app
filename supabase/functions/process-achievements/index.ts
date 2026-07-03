import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Achievement conditions keyed by achievement code
const ACHIEVEMENT_CONDITIONS: Record<string, (stats: UserStats) => boolean> = {
  FIRST_WORKOUT: (s) => s.total_workouts >= 1,
  TEN_WORKOUTS: (s) => s.total_workouts >= 10,
  FIFTY_WORKOUTS: (s) => s.total_workouts >= 50,
  HUNDRED_WORKOUTS: (s) => s.total_workouts >= 100,
  WEEK_STREAK: (s) => s.best_streak >= 7,
  MONTH_STREAK: (s) => s.best_streak >= 30,
  HUNDRED_HOURS: (s) => s.total_training_seconds >= 360_000,
  TEN_THOUSAND_KG: (s) => s.total_weight_lifted >= 10_000,
  HUNDRED_THOUSAND_KG: (s) => s.total_weight_lifted >= 100_000,
  MARATHON: (s) => s.total_distance_meters >= 42_195,
}

interface UserStats {
  total_workouts: number
  total_training_seconds: number
  total_weight_lifted: number
  total_distance_meters: number
  current_streak: number
  best_streak: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { user_id } = await req.json()
    if (!user_id) return json({ error: 'Missing user_id' }, 400)

    // Fetch current stats
    const { data: stats, error: statsError } = await supabaseService
      .from('user_stats')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (statsError || !stats) return json({ error: 'User stats not found' }, 404)

    // Fetch all available achievements
    const { data: allAchievements } = await supabaseService
      .from('achievements')
      .select('id, code')

    // Fetch already unlocked achievements
    const { data: unlockedAchievements } = await supabaseService
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user_id)

    const unlockedIds = new Set((unlockedAchievements ?? []).map((a) => a.achievement_id))

    const newlyUnlocked: { user_id: string; achievement_id: string; unlocked_at: string }[] = []

    for (const achievement of allAchievements ?? []) {
      if (unlockedIds.has(achievement.id)) continue

      const condition = ACHIEVEMENT_CONDITIONS[achievement.code]
      if (condition && condition(stats)) {
        newlyUnlocked.push({
          user_id,
          achievement_id: achievement.id,
          unlocked_at: new Date().toISOString(),
        })
      }
    }

    if (newlyUnlocked.length > 0) {
      await supabaseService.from('user_achievements').insert(newlyUnlocked)
    }

    return json({ success: true, data: { unlocked: newlyUnlocked.length } })
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
