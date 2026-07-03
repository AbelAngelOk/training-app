import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RANKING_TYPES = ['training_hours', 'weight_lifted', 'distance'] as const
type RankingType = typeof RANKING_TYPES[number]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const snapshotDate = new Date().toISOString().split('T')[0]

    // Fetch all users with their stats and profiles
    const { data: users, error: usersError } = await supabaseService
      .from('users')
      .select(`
        id,
        role,
        user_stats ( total_training_seconds, total_weight_lifted, total_distance_meters ),
        user_profiles ( city, province, country )
      `)

    if (usersError) throw usersError

    const snapshots: {
      user_id: string
      ranking_type: RankingType
      value: number
      city: string | null
      province: string | null
      country: string | null
      snapshot_date: string
    }[] = []

    for (const user of users ?? []) {
      const stats = Array.isArray(user.user_stats) ? user.user_stats[0] : user.user_stats
      const profile = Array.isArray(user.user_profiles) ? user.user_profiles[0] : user.user_profiles
      if (!stats) continue

      // Only premium users appear in global/regional rankings
      const isPremium = user.role === 'premium_user' || user.role === 'coach' || user.role === 'admin'

      if (!isPremium) continue

      const values: Record<RankingType, number> = {
        training_hours: stats.total_training_seconds / 3600,
        weight_lifted: stats.total_weight_lifted,
        distance: stats.total_distance_meters / 1000,
      }

      for (const rankingType of RANKING_TYPES) {
        snapshots.push({
          user_id: user.id,
          ranking_type: rankingType,
          value: values[rankingType],
          city: profile?.city ?? null,
          province: profile?.province ?? null,
          country: profile?.country ?? null,
          snapshot_date: snapshotDate,
        })
      }
    }

    if (snapshots.length === 0) {
      return json({ success: true, data: { processed: 0 } })
    }

    // Upsert snapshots (one per user per ranking_type per day)
    const { error: upsertError } = await supabaseService
      .from('ranking_snapshots')
      .upsert(snapshots, { onConflict: 'user_id,ranking_type,snapshot_date' })

    if (upsertError) throw upsertError

    return json({ success: true, data: { processed: snapshots.length } })
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
