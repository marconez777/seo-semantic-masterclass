
// supabase/functions/abacate-webhook/index.ts
// Edge Function: abacate-webhook
// Purpose: Receive Abacate Pay webhook events and update order status in Supabase
// Security: Public (no JWT). Validates a shared secret token via header or query string

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
    case 'ACTIVE':
      // Some providers mark billing as ACTIVE before payment; don't force-map to paid
      return 'pending'
    default:
      return null
  }
}

function resolveStatusFromPayload(payload: any): 'pending' | 'paid' | 'cancelled' | 'refunded' | null {
  // Try explicit status fields first
  const statusStr =
    payload?.status ??
    payload?.data?.status ??
    payload?.billing?.status ??
    null
  const m1 = mapStatus(statusStr)
  if (m1) return m1

  // Fallback to event/type strings commonly sent by providers
  const ev =
    (payload?.event ?? payload?.type ?? payload?.action ?? '') as string
  const e = ev.toUpperCase()
  if (e.includes('PAID')) return 'paid'
  if (e.includes('REFUND')) return 'refunded'
  if (e.includes('CANCEL') || e.includes('EXPIRE')) return 'cancelled'
  if (e.includes('PENDING') || e.includes('ACTIVE')) return 'pending'
  return null
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
      console.error('[abacate-webhook] Missing ABACATEPAY_WEBHOOK_TOKEN')
      return new Response(JSON.stringify({ error: 'Missing ABACATEPAY_WEBHOOK_TOKEN' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Accept either:
    // - Authorization: Bearer <token>
    // - X-Webhook-Token: <token>
    // - Query param ?webhookSecret=<token> (or ?token= / ?secret=)
    const url = new URL(req.url)
    const authHeader = req.headers.get('authorization')
    const headerToken = getBearerToken(authHeader)
    const xToken = req.headers.get('x-webhook-token')
    const qToken =
      url.searchParams.get('webhookSecret') ??
      url.searchParams.get('token') ??
      url.searchParams.get('secret')

    let token = headerToken ?? xToken ?? qToken
    const tokenSource = headerToken ? 'authorization' : xToken ? 'x-webhook-token' : qToken ? 'query' : 'none'
    if (token) {
      try { token = decodeURIComponent(token) } catch {}
      const qIdx = token.indexOf('?'); if (qIdx > -1) token = token.substring(0, qIdx)
      const ampIdx = token.indexOf('&'); if (ampIdx > -1) token = token.substring(0, ampIdx)
      token = token.trim()
    }
    console.log('[abacate-webhook] tokenSource:', tokenSource)

    if (!token || token !== secret) {
      console.warn('[abacate-webhook] Unauthorized webhook call', { tokenLen: token?.length ?? 0, tokenSource })
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const payload = await req.json().catch(() => ({}))
    console.log('[abacate-webhook] received payload')

    const billId =
      payload?.id ??
      payload?.data?.id ??
      payload?.billId ??
      payload?.billingId ??
      payload?.data?.billId ??
      payload?.data?.billingId ??
      payload?.billing?.id ??
      payload?.data?.billing?.id ??
      null

    const resolvedStatus = resolveStatusFromPayload(payload)

    if (!billId || !resolvedStatus) {
      console.log('[abacate-webhook] invalid input', {
        hasBillId: Boolean(billId),
        resolvedStatus,
        rawStatus: payload?.status ?? payload?.data?.status ?? payload?.billing?.status,
        event: payload?.event ?? payload?.type ?? payload?.action,
      })
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRole) {
      console.error('[abacate-webhook] Missing Supabase env vars')
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
      .update({ status: resolvedStatus })
      .eq('abacate_bill_id', billId)

    if (error) {
      console.error('[abacate-webhook] DB update error', error)
      return new Response(JSON.stringify({ error: 'DB update failed', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    console.log('[abacate-webhook] updated pedido', { billId, status: resolvedStatus })

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
