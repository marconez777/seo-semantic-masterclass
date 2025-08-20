import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Setup CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to create a standard Supabase client for user authentication
const createAuthClient = (req: Request): SupabaseClient | Response => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders })
  }

  // The anon key is safe to be public
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )
  return supabase
}

// Main function handler
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validate required environment variables for auth
    if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_ANON_KEY')) {
      console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY env variables.')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Get user via token from Authorization header
    const authClient = createAuthClient(req)
    if (authClient instanceof Response) {
      return authClient // Return the 401 response if auth header is missing
    }

    const { data: { user }, error: userError } = await authClient.auth.getUser()

    if (userError || !user) {
      console.error('Authentication error:', userError?.message)
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Check if the user is an admin
    const { data: isAdmin, error: rpcError } = await authClient.rpc('is_admin', { p_user_id: user.id })

    if (rpcError) {
      console.error('RPC is_admin call failed:', rpcError.message)
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Only now, create a client with the SERVICE_ROLE_KEY to fetch PII
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY env variable.')
      return new Response(
        JSON.stringify({ error: 'Critical server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdminClient = createClient(Deno.env.get('SUPABASE_URL')!, serviceRoleKey)

    const { order_ids } = await req.json()
    if (!order_ids || !Array.isArray(order_ids)) {
      return new Response(
        JSON.stringify({ error: 'order_ids must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Call the secure function to get PII data
    const { data, error: piiError } = await supabaseAdminClient.rpc('get_masked_pii_secure', {
      p_order_ids: order_ids,
    })

    if (piiError) {
      console.error('Database error fetching PII:', piiError.message)
      return new Response(
        JSON.stringify({ error: 'Database error while fetching PII' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Unhandled function error:', err.message)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})