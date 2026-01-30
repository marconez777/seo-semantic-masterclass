import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Get the user from the token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin using user_roles table (RBAC)
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!roleData) {
      // Fallback to profiles.is_admin for backwards compatibility during migration
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single()

      if (profile?.is_admin !== true) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const body = await req.json()
    const { order_ids, single_order_id } = body

    // Handle single order ID (for receipts)
    if (single_order_id) {
      // Fetch order to get user_id
      const { data: order } = await supabaseClient
        .from('orders_new')
        .select('user_id')
        .eq('id', single_order_id)
        .single()
      
      if (order?.user_id) {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('email, full_name, whatsapp')
          .eq('user_id', order.user_id)
          .single()
        
        return new Response(
          JSON.stringify({ 
            data: [{
              order_id: single_order_id,
              customer_email: profile?.email ?? null,
              customer_name: profile?.full_name ?? null,
              customer_phone: profile?.whatsapp ?? null,
              customer_cpf: null
            }] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!order_ids || !Array.isArray(order_ids)) {
      return new Response(
        JSON.stringify({ error: 'order_ids must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch orders to get user_ids
    const { data: orders } = await supabaseClient
      .from('orders_new')
      .select('id, user_id')
      .in('id', order_ids)

    if (!orders || orders.length === 0) {
      return new Response(
        JSON.stringify({ data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get unique user_ids
    const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))]

    // Fetch profiles for all users
    const { data: profiles } = await supabaseClient
      .from('profiles')
      .select('user_id, email, full_name, whatsapp')
      .in('user_id', userIds)

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) ?? [])

    // Map order data with customer info
    const result = orders.map(order => ({
      order_id: order.id,
      customer_email: profileMap.get(order.user_id)?.email ?? null,
      customer_name: profileMap.get(order.user_id)?.full_name ?? null,
      customer_phone: profileMap.get(order.user_id)?.whatsapp ?? null,
      customer_cpf: null
    }))

    return new Response(
      JSON.stringify({ data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
