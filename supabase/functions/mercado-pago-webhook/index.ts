import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Webhook received:', body);

    // Mercado Pago webhook verification
    if (body.action === 'payment.updated' || body.action === 'payment.created') {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        console.log('No payment ID in webhook');
        return new Response('OK', { status: 200 });
      }

      // Get payment details from Mercado Pago
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')}`,
        },
      });

      const payment = await response.json();
      console.log('Payment details:', payment);

      if (!response.ok) {
        throw new Error(`Failed to fetch payment: ${payment.message}`);
      }

      // Initialize Supabase with service role key to bypass RLS
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );

      // Find the order by payment ID (stored in stripe_session_id field)
      const { data: orders, error: findError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('stripe_session_id', paymentId.toString());

      if (findError) {
        console.error('Error finding order:', findError);
        return new Response('Error finding order', { status: 500 });
      }

      if (!orders || orders.length === 0) {
        console.log('No order found for payment ID:', paymentId);
        return new Response('Order not found', { status: 404 });
      }

      const order = orders[0];
      let newStatus = 'pendente';

      // Map Mercado Pago status to our status
      switch (payment.status) {
        case 'approved':
          newStatus = 'pago';
          break;
        case 'pending':
        case 'in_process':
          newStatus = 'pendente';
          break;
        case 'rejected':
        case 'cancelled':
          newStatus = 'cancelado';
          break;
        default:
          newStatus = 'pendente';
      }

      // Update order status
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ 
          pagamento_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Error updating order:', updateError);
        return new Response('Error updating order', { status: 500 });
      }

      console.log(`Order ${order.id} updated to status: ${newStatus}`);
    }

    return new Response('OK', { 
      headers: corsHeaders,
      status: 200 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});