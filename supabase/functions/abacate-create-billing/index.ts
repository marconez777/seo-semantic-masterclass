// supabase/functions/abacate-create-billing/index.ts
// Edge Function: abacate-create-billing
// Purpose: Create a billing (cobrança) on Abacate Pay securely using server-side API key
// Auth: Requires JWT (default). Frontend should call via supabase.functions.invoke

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

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
      metadata: payload.metadata ?? undefined,
    }

    console.log('[abacate-create-billing] request body', JSON.stringify(body))

    if (!body.products || body.products.length < 1) {
      return new Response(JSON.stringify({ error: 'At least one product is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

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

    const url = data?.data?.url ?? null

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
