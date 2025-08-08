import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get('ABACATEPAY_WEBHOOK_TOKEN');
    if (!token) {
      return new Response(JSON.stringify({ error: 'ABACATEPAY_WEBHOOK_TOKEN not set' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const auth = req.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ') || auth.replace('Bearer ', '').trim() !== token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const payload = await req.json();
    const data = payload?.data ?? payload;
    const id = data?.id;
    const status = (data?.status || '').toUpperCase();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing billing id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let pagamento_status: string | null = null;
    switch (status) {
      case 'PAID':
        pagamento_status = 'pago';
        break;
      case 'CANCELLED':
      case 'EXPIRED':
        pagamento_status = 'cancelado';
        break;
      case 'PENDING':
        pagamento_status = 'pendente';
        break;
      case 'REFUNDED':
        pagamento_status = 'cancelado';
        break;
    }

    if (pagamento_status) {
      const { error: upErr } = await supabase
        .from('pedidos')
        .update({ pagamento_status })
        .eq('payment_reference', id);

      if (upErr) throw upErr;
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});