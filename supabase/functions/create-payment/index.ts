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
    const { orders, order_id, amount, description } = await req.json();

    if (!amount || !description) {
      throw new Error('Missing required fields: amount, description');
    }

    // For multiple orders, use the first order's ID, otherwise use the single order_id
    const referenceId = orders && orders.length > 0 ? orders[0].id : order_id;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    // Create Mercado Pago payment
    const paymentData = {
      transaction_amount: amount,
      description: description,
      payment_method_id: 'pix', // Default to PIX, can be changed to support multiple methods
      payer: {
        email: user.email,
        first_name: user.user_metadata?.full_name?.split(' ')[0] || 'Cliente',
        last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      },
      external_reference: referenceId,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercado-pago-webhook`,
    };

    console.log('Creating payment with data:', paymentData);

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const paymentResult = await response.json();
    console.log('Mercado Pago response:', paymentResult);

    if (!response.ok) {
      throw new Error(`Mercado Pago error: ${paymentResult.message || 'Unknown error'}`);
    }

    // Update order with payment info
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Update orders with payment info
    if (orders && orders.length > 0) {
      // Update multiple orders
      const orderIds = orders.map(order => order.id);
      await supabaseService
        .from('pedidos')
        .update({
          stripe_session_id: paymentResult.id.toString(), // Using this field to store MP payment ID
        })
        .in('id', orderIds);
    } else if (order_id) {
      // Update single order (backward compatibility)
      await supabaseService
        .from('pedidos')
        .update({
          stripe_session_id: paymentResult.id.toString(), // Using this field to store MP payment ID
        })
        .eq('id', order_id);
    }

    return new Response(
      JSON.stringify({
        payment_id: paymentResult.id,
        status: paymentResult.status,
        payment_url: paymentResult.point_of_interaction?.transaction_data?.ticket_url || 
                    paymentResult.point_of_interaction?.transaction_data?.qr_code_base64 ? 
                    `data:image/png;base64,${paymentResult.point_of_interaction.transaction_data.qr_code_base64}` : 
                    null,
        qr_code: paymentResult.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: paymentResult.point_of_interaction?.transaction_data?.qr_code_base64,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});