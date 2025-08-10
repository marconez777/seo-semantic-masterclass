// supabase/functions/abacate-webhook/index.ts
// Edge Function: abacate-webhook
// Purpose: Receive Abacate Pay webhook events and update order status in Supabase
// Security: Public (no JWT). Validates a shared secret token via header

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-token',
}

function getBearerToken(h: string | null): string | null {
  if (!h) return null
  const m = /^Bearer\s+(.+)$/i.exec(h)
  return m ? m[1] : null
}

function mapStatus(s: string | null | undefined): 'pending' | 'paid' | 'cancelled' | 'refunded' | null {
  const v = (s ?? '').toUpperCase()
  switch (v) {
    case 'PENDING':
      return 'pending'
    case 'PAID':
      return 'paid'
    case 'CANCELLED':
      return 'cancelled'
    case 'REFUNDED':
      return 'refunded'
    case 'EXPIRED':
      return 'cancelled'
    default:
      return null
  }
}

Deno.serve(async (req) => {
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

    const secret = Deno.env.get('ABACATEPAY_WEBHOOK_TOKEN')
    if (!secret) {
      return new Response(JSON.stringify({ error: 'Missing ABACATEPAY_WEBHOOK_TOKEN' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Accept either Authorization: Bearer <token> or X-Webhook-Token: <token>
    const authHeader = req.headers.get('authorization')
    const headerToken = getBearerToken(authHeader)
    const xToken = req.headers.get('x-webhook-token')
    const token = headerToken ?? xToken

    if (!token || token !== secret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const payload = await req.json().catch(() => ({}))
    console.log('[abacate-webhook] payload', JSON.stringify(payload))

    const billId = payload?.id ?? payload?.data?.id ?? payload?.billId ?? null
    const statusStr = payload?.status ?? payload?.data?.status ?? null
    const mapped = mapStatus(statusStr)

    if (!billId || !mapped) {
      console.log('[abacate-webhook] invalid input', { billId, statusStr })
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRole) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const supabase = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false },
    })

    const { error } = await supabase
      .from('pedidos')
      .update({ status: mapped })
      .eq('abacate_bill_id', billId)

    if (error) {
      console.error('[abacate-webhook] update error', error)
      return new Response(JSON.stringify({ error: 'DB update failed', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    console.log('[abacate-webhook] updated', { billId, status: mapped })

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (e) {
    console.error('[abacate-webhook] unexpected', e)
    return new Response(JSON.stringify({ error: 'Unexpected error', message: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
