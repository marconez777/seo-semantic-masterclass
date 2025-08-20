import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('[manual-create-order] Request received:', req.method, req.url)
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[manual-create-order] Handling CORS preflight')
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      console.log('[manual-create-order] Method not allowed:', req.method)
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('[manual-create-order] Environment check:', {
      hasUrl: !!SUPABASE_URL,
      hasAnonKey: !!SUPABASE_ANON_KEY,
      hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
    })

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[manual-create-order] Missing environment variables')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    console.log('[manual-create-order] Auth header present:', !!authHeader)

    if (!token) {
      console.error('[manual-create-order] No authorization token provided')
      return new Response(JSON.stringify({ error: 'Unauthorized - no token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Validate user through token
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { 
      auth: { persistSession: false } 
    })
    
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token)
    
    console.log('[manual-create-order] User validation:', {
      hasUser: !!userData?.user,
      userId: userData?.user?.id,
      error: userErr?.message
    })

    if (userErr || !userData?.user?.id) {
      console.error('[manual-create-order] auth error', userErr)
      return new Response(JSON.stringify({ error: 'Unauthorized - invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const user = userData.user

    // Create Supabase clients
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    })

    const supabaseServiceRole = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    // Parse request body
    let payload: any = {}
    try {
      payload = await req.json()
      console.log('[manual-create-order] Request payload:', JSON.stringify(payload, null, 2))
    } catch (e) {
      console.error('[manual-create-order] Failed to parse JSON:', e)
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Validate products
    const products = Array.isArray(payload.products) ? payload.products : []
    if (!products.length) {
      console.error('[manual-create-order] No products provided')
      return new Response(JSON.stringify({ error: 'At least one product is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Calculate total in cents
    const total_cents = products.reduce((acc: number, p: any) => {
      const q = Number(p?.quantity ?? 0)
      const price = Number(p?.price ?? 0)
      return acc + q * price
    }, 0)

    console.log('[manual-create-order] Total calculated:', total_cents)

    // Extract customer data
    const meta: any = (user as any)?.user_metadata ?? {}
    const customer_email = user.email ?? payload.customer?.email ?? null
    const customer_name = payload.customer?.name ?? meta?.name ?? meta?.full_name ?? null
    const customer_cpf = payload.customer?.cpf ?? payload.customer?.taxId ?? meta?.cpf ?? null
    const customer_phone = payload.customer?.phone ?? payload.customer?.cellphone ?? meta?.phone ?? null

    console.log('[manual-create-order] Customer data:', {
      email: customer_email,
      name: customer_name,
      hasCpf: !!customer_cpf,
      hasPhone: !!customer_phone
    })

    // Create order
    const { data: pedido, error: pedidoErr } = await supabaseUser
      .from('pedidos')
      .insert({ 
        user_id: user.id, 
        total_cents, 
        status: 'pending',
        payment_method: 'pix_manual'
      })
      .select('id')
      .single()

    console.log('[manual-create-order] Order creation:', {
      success: !!pedido,
      orderId: pedido?.id,
      error: pedidoErr?.message
    })

    if (pedidoErr) {
      console.error('[manual-create-order] insert pedido error', pedidoErr)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create order', 
          details: String(pedidoErr?.message ?? pedidoErr) 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Insert encrypted PII data
    if (pedido?.id) {
      const { error: piiErr } = await supabaseServiceRole.rpc('insert_encrypted_pii_secure', {
        p_order_id: pedido.id,
        p_customer_email: customer_email,
        p_customer_name: customer_name,
        p_customer_cpf: customer_cpf,
        p_customer_phone: customer_phone,
      })
      
      if (piiErr) {
        console.error('[manual-create-order] insert pedidos_pii error', piiErr)
      } else {
        console.log('[manual-create-order] PII data inserted successfully')
      }
    }

    // Prepare metadata items
    const metaItems = Array.isArray(payload?.metadata?.items) ? payload.metadata.items : []
    const metaMap = new Map<string, any>()
    for (const it of metaItems) {
      if (it?.externalId) metaMap.set(String(it.externalId), it)
    }

    // Insert order items
    const itemsToInsert = products.map((p: any) => {
      const externalId = String(p?.externalId ?? '')
      const m = metaMap.get(externalId) ?? {}
      const quantity = Number(p?.quantity ?? 1)
      const price = Number(p?.price ?? 0)
      return {
        order_id: pedido.id,
        backlink_id: externalId,
        quantity,
        price_cents: price,
        anchor_text: m?.anchorText ?? undefined,
        target_url: m?.targetUrl ?? undefined,
      }
    })

    console.log('[manual-create-order] Inserting items:', itemsToInsert.length)

    if (itemsToInsert.length) {
      const { error: itemsErr } = await supabaseUser.from('order_items').insert(itemsToInsert)
      if (itemsErr) {
        console.error('[manual-create-order] insert order_items error', itemsErr)
      } else {
        console.log('[manual-create-order] Order items inserted successfully')
      }
    }

    console.log('[manual-create-order] Order created successfully:', pedido.id)

    return new Response(JSON.stringify({ 
      ok: true, 
      orderId: pedido.id, 
      mode: 'manual' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (e) {
    console.error('[manual-create-order] unexpected error', e)
    return new Response(JSON.stringify({ 
      error: 'Unexpected error', 
      message: String(e) 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})