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
      return new Response(JSON.stringify({ error: 'ABACATEPAY_API_KEY not set' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const orders = body?.orders as string[] | undefined;
    const products = body?.products as Array<any> | undefined;
    const customer = body?.customer as any;

    if (!orders?.length) {
      return new Response(JSON.stringify({ error: 'orders is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!customer?.email || !customer?.name) {
      return new Response(JSON.stringify({ error: 'customer.name and customer.email are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!customer?.taxId) {
      return new Response(JSON.stringify({ error: 'customer.taxId (CPF) is required' }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let billingProducts: any[] = [];
    if (products?.length) {
      billingProducts = products.map((p) => ({
        externalId: String(p.externalId),
        name: String(p.name),
        description: p.description ? String(p.description) : undefined,
        quantity: Number(p.quantity || 1),
        price: Number(p.price), // cents
      }));
    } else {
      const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select('id, preco_centavos')
        .in('id', orders);

      if (error) throw error;
      if (!pedidos?.length) {
        return new Response(JSON.stringify({ error: 'orders not found' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      billingProducts = pedidos.map((p: any) => ({
        externalId: p.id,
        name: 'Backlink',
        quantity: 1,
        price: Number(p.preco_centavos),
      }));
    }

    const payload = {
      frequency: 'ONE_TIME',
      methods: ['PIX'],
      products: billingProducts,
      returnUrl: 'https://mkart.com.br/painel',
      completionUrl: 'https://mkart.com.br/painel?paid=1',
      customer: {
        metadata: {
          name: customer.name,
          email: customer.email,
          taxId: customer.taxId,
          cellphone: customer.cellphone ?? undefined,
        }
      },
    };

    const res = await fetch(`${ABACATE_API}/billing/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      return new Response(JSON.stringify({ error: 'abacate-create failed', details: txt }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const json = await res.json();
    const data = json?.data ?? json;

    const { error: upErr } = await supabase
      .from('pedidos')
      .update({ payment_reference: data.id, payment_provider: 'abacatepay', pagamento_status: 'pendente' })
      .in('id', orders);

    if (upErr) throw upErr;

    return new Response(JSON.stringify({ url: data.url, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});