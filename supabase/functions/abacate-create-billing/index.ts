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
    const inb = await req.json().catch(() => ({}));

    const apiKey = Deno.env.get('ABACATEPAY_API_KEY');
    if (!apiKey) {
      console.error('[abacate-create-billing] ABACATEPAY_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'ABACATEPAY_API_KEY not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const baseUrl = Deno.env.get('ABACATEPAY_BASE_URL') || `${ABACATE_API}/v1`;
    const createPath = Deno.env.get('ABACATEPAY_CREATE_BILLING_PATH') || '/billing/create';
    const url = `${baseUrl.replace(/\/$/, '')}${createPath.startsWith('/') ? '' : '/'}${createPath}`;

    // BASE do app para montar URLs de retorno (preview/prod)
    const appBase = Deno.env.get('APP_BASE_URL') || 'https://mkart.com.br';
    const returnUrl = inb.returnUrl ?? `${appBase}/checkout/sucesso`;
    const completionUrl = inb.completionUrl ?? `${appBase}/checkout/sucesso`;

    // Métodos / Frequência exigidos
    const frequency = inb.frequency ?? 'ONE_TIME';
    const methods = inb.methods ?? ['PIX'];

    // Mapear products para o formato da Abacate (aceita interno ou já correto)
    const products = (inb.products || []).map((p: any, idx: number) => ({
      externalId: p.externalId ?? p.id ?? `item-${idx + 1}`,
      name: p.name ?? p.title ?? p.site ?? `Produto ${idx + 1}`,
      description: p.description ?? p.desc ?? '',
      quantity: p.quantity ?? 1,
      price: Number.isInteger(p.price)
        ? p.price
        : Math.round(
            Number(
              p.unit_price_cents ??
              p.preco_centavos ??
              ((p.preco ?? p.valor) != null ? (p.preco ?? p.valor) * 100 : 0)
            )
          ),
    }));

    // Mapear customer para camelCase exigido pela Abacate
    const customerRaw = inb.customer || {};
    const customer = {
      name: customerRaw.name ?? customerRaw.nome ?? '',
      cellphone: customerRaw.cellphone ?? customerRaw.telefone ?? '',
      email: customerRaw.email ?? '',
      taxId: customerRaw.taxId ?? customerRaw.tax_id ?? customerRaw.cpf ?? '',
    };

    // Validações mínimas
    if (!Array.isArray(products) || products.length === 0) {
      return new Response(JSON.stringify({ error: 'products_required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (!returnUrl) {
      return new Response(JSON.stringify({ error: 'returnUrl_required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const payload = {
      frequency,
      methods,
      products,
      returnUrl,
      completionUrl,
      customerId: inb.customerId,
      customer,
      allowCoupons: inb.allowCoupons ?? false,
      coupons: inb.coupons ?? [],
      metadata: inb.metadata,
    } as const;

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