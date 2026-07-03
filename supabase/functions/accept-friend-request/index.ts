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
    if (!authHeader) return json({ error: 'Missing authorization header' }, 401)

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

    const { request_id } = await req.json()
    if (!request_id) return json({ error: 'Missing request_id' }, 400)

    // Verify the request belongs to this user as receiver and is pending
    const { data: request, error: requestError } = await supabaseService
      .from('friend_requests')
      .select('*')
      .eq('id', request_id)
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .single()

    if (requestError || !request) {
      return json({ error: 'Friend request not found or already processed' }, 404)
    }

    // Check friendship doesn't already exist
    const [userA, userB] = [request.sender_id, request.receiver_id].sort()
    const { data: existingFriendship } = await supabaseService
      .from('friendships')
      .select('id')
      .eq('user_a_id', userA)
      .eq('user_b_id', userB)
      .maybeSingle()

    if (existingFriendship) {
      return json({ error: 'Friendship already exists' }, 409)
    }

    // Update request status
    await supabaseService
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', request_id)

    // Create friendship (service_role required)
    const { data: friendship, error: friendshipError } = await supabaseService
      .from('friendships')
      .insert({ user_a_id: userA, user_b_id: userB })
      .select()
      .single()

    if (friendshipError) throw friendshipError

    return json({ success: true, data: friendship })
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
