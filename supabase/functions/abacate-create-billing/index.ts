import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ABACATE_API = 'https://api.abacatepay.com';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const input = await req.json().catch(() => ({}));

    const apiKey = Deno.env.get('ABACATEPAY_API_KEY');
    if (!apiKey) {
      console.error('[abacate-create-billing] ABACATEPAY_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'ABACATEPAY_API_KEY not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Defaults obrigatórios para a Abacate Pay
    const payload = {
      frequency: input.frequency ?? 'ONE_TIME',
      methods: input.methods ?? ['PIX'],
      products: input.products ?? [],
      returnUrl: input.returnUrl,
      completionUrl: input.completionUrl,
      customerId: input.customerId,
      customer: input.customer,
      allowCoupons: input.allowCoupons ?? false,
      coupons: input.coupons ?? [],
      currency: input.currency ?? 'BRL',
      metadata: input.metadata,
    };

    // Validação básica
    if (!Array.isArray(payload.products) || payload.products.length === 0) {
      return new Response(JSON.stringify({ error: 'products_required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const baseUrl = Deno.env.get('ABACATEPAY_BASE_URL') || `${ABACATE_API}/v1`;
    const createPath = Deno.env.get('ABACATEPAY_CREATE_BILLING_PATH') || '/billing/create';
    const url = `${baseUrl.replace(/\/$/, '')}${createPath.startsWith('/') ? '' : '/'}${createPath}`;
    console.log('[abacate-create-billing] URL:', url);
    console.log('[abacate-create-billing] OUT payload:', payload);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[abacate-create-billing] Abacate error:', errText);
      return new Response(errText, {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('[abacate-create-billing] Exception:', e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});