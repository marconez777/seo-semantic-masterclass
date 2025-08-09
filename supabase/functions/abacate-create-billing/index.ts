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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const apiKey = Deno.env.get('ABACATEPAY_API_KEY');
    if (!apiKey) {
      console.error('[abacate-create-billing] ABACATEPAY_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'ABACATEPAY_API_KEY not set' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const body = await req.json().catch(() => null);
    console.log('[abacate-create-billing] Received body:', body);

    // Validate input format - new payload structure
    if (!body?.customer?.tax_id) {
      console.error('[abacate-create-billing] Missing customer.tax_id');
      return new Response(JSON.stringify({ error: 'customer.tax_id is required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const cpf = String(body.customer.tax_id).replace(/\D/g, '');
    if (cpf.length !== 11) {
      console.error('[abacate-create-billing] Invalid CPF length:', cpf.length);
      return new Response(JSON.stringify({ error: 'invalid_tax_id' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (!Array.isArray(body?.products) || body.products.length === 0) {
      console.error('[abacate-create-billing] Invalid products array');
      return new Response(JSON.stringify({ error: 'products_required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    for (const p of body.products) {
      if (!p?.quantity || !Number.isFinite(p?.unit_price_cents)) {
        console.error('[abacate-create-billing] Invalid product format:', p);
        return new Response(JSON.stringify({ error: 'invalid_product_format' }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    }

    const customer = body.customer;
    const products = body.products;

    // Map to Abacate Pay expected format
    const billingProducts = products.map((p: any) => ({
      title: String(p.title || p.name || 'Produto'),
      quantity: Number(p.quantity || 1),
      unit_price_cents: Number(p.unit_price_cents || p.price || 0)
    }));

    const currency = body.currency || 'BRL';

    const payload = {
      customer: {
        name: String(customer.name || 'Cliente'),
        tax_id: cpf
      },
      products: billingProducts,
      currency: currency
    };

    console.log('[abacate-create-billing] Sending payload to Abacate:', payload);

    const res = await fetch(`${ABACATE_API}/v1/billing/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
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
    console.log('[abacate-create-billing] Abacate response:', result);

    const responseData = {
      url: result?.url || result?.checkout_url || result?.pix_url,
      id: result?.id,
      raw: result
    };

    if (!responseData.url) {
      console.error('[abacate-create-billing] No URL in response:', result);
      return new Response(JSON.stringify({ error: 'No payment URL returned' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify(responseData), {
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