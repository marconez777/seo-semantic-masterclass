
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const apiKey = Deno.env.get('ABACATEPAY_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing ABACATEPAY_API_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Create Supabase clients
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token)
    if (userErr || !userData?.user?.id) {
      console.error('[abacate-create-billing] auth error', userErr)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }
    const user = userData.user
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    })

    const payload = await req.json().catch(() => ({}))

    // Minimal shaping and sane defaults
    const body = {
      frequency: payload.frequency === 'ONE_TIME' ? 'ONE_TIME' : 'MULTIPLE_PAYMENTS',
      methods: Array.isArray(payload.methods) && payload.methods.length > 0 ? payload.methods : ['PIX'],
      products: Array.isArray(payload.products) ? payload.products : [],
      returnUrl: payload.returnUrl ?? `${new URL(req.url).origin}/carrinho`,
      completionUrl: payload.completionUrl ?? `${new URL(req.url).origin}/payment-success`,
      customerId: payload.customerId,
      customer: payload.customer,
      allowCoupons: Boolean(payload.allowCoupons ?? false),
      coupons: Array.isArray(payload.coupons) ? payload.coupons : [],
      metadata: payload.metadata ?? undefined, // We also rely on this to store order items metadata
    }

    console.log('[abacate-create-billing] request body', JSON.stringify(body))

    if (!body.products || body.products.length < 1) {
      return new Response(JSON.stringify({ error: 'At least one product is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Create billing on Abacate Pay
    const res = await fetch('https://api.abacatepay.com/v1/billing/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => null)
    console.log('[abacate-create-billing] response status', res.status)
    console.log('[abacate-create-billing] response body', JSON.stringify(data))

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: data?.error ?? 'Failed to create billing', status: res.status }),
        { status: res.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Persist order (pedido) and items
    const url = data?.data?.url ?? null
    const abacateBillId = data?.data?.id ?? null
    const amountFromApi = Number(data?.data?.amount ?? 0)

    // Compute total cents as fallback
    const totalFromProducts = (Array.isArray(body.products) ? body.products : []).reduce((acc: number, p: any) => {
      const q = Number(p?.quantity ?? 0)
      const price = Number(p?.price ?? 0)
      return acc + q * price
    }, 0)
    const total_cents = amountFromApi > 0 ? amountFromApi : totalFromProducts

    // Insert pedido
    const { data: pedido, error: pedidoErr } = await supabaseUser
      .from('pedidos')
      .insert({
        user_id: user.id,
        total_cents,
        status: 'pending', // pagamento pendente; webhook deve atualizar para 'paid' depois
        abacate_bill_id: abacateBillId,
        abacate_url: url,
      })
      .select('id')
      .single()

    if (pedidoErr) {
      console.error('[abacate-create-billing] insert pedido error', pedidoErr)
      // Still return the URL so user can pay, but indicate DB issue
      return new Response(
        JSON.stringify({ url, warning: 'Pedido not persisted', details: String(pedidoErr?.message ?? pedidoErr) }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Map metadata items by externalId for anchor/target
    const metaItems = Array.isArray(body?.metadata?.items) ? body.metadata.items : []
    const metaMap = new Map<string, any>()
    for (const it of metaItems) {
      if (it?.externalId) metaMap.set(String(it.externalId), it)
    }

    // Prepare order_items
    const itemsToInsert = (Array.isArray(body.products) ? body.products : []).map((p: any) => {
      const externalId = String(p?.externalId ?? '')
      const meta = metaMap.get(externalId) ?? {}
      const quantity = Number(p?.quantity ?? 1)
      const price = Number(p?.price ?? 0)
      return {
        order_id: pedido.id,
        backlink_id: externalId, // expecting externalId to be the backlink UUID
        quantity,
        price_cents: price,
        anchor_text: meta?.anchorText ?? undefined,
        target_url: meta?.targetUrl ?? undefined,
      }
    })

    if (itemsToInsert.length > 0) {
      const { error: itemsErr } = await supabaseUser.from('order_items').insert(itemsToInsert)
      if (itemsErr) {
        console.error('[abacate-create-billing] insert order_items error', itemsErr)
      }
    }

    // Return simplified payload
    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (e) {
    console.error('[abacate-create-billing] unexpected', e)
    return new Response(JSON.stringify({ error: 'Unexpected error', message: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
