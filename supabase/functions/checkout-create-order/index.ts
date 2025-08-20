import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

Deno.serve(async (req) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    console.log(`Method ${req.method} not allowed`);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Get authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Validate user
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError || !userData?.user) {
      console.error('Invalid user token:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const user = userData.user;
    console.log(`Authenticated user: ${user.email}`);

    // Parse request body
    const { items, total_cents } = await req.json();

    if (!items || !total_cents) {
      return new Response(JSON.stringify({ error: 'Invalid request: items and total_cents required' }), { status: 400, headers: corsHeaders });
    }
    const totalCents = total_cents;

    console.log(`Creating order for user ${user.id}, total: ${totalCents} cents`);

    // Create authenticated client
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false }
    });

    // Create order
    const { data: order, error: orderError } = await supabaseUser
      .from('pedidos')
      .insert({
        user_id: user.id,
        total_cents: totalCents,
        status: 'pending',
        payment_method: 'pix_manual'
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Failed to create order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`Order created: ${order.id}`);

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      backlink_id: item.id,
      quantity: item.quantity,
      price_cents: item.price_cents,
      anchor_text: item.texto_ancora,
      target_url: item.url_destino,
    }));

    await supabaseUser.from('order_items').insert(orderItems);

    console.log(`Order ${order.id} completed successfully`);

    console.log(`Order ${order.id} completed successfully`);

    return new Response(JSON.stringify({
      order_id: order.id,
      pix_key: Deno.env.get('PIX_KEY'),
      total_cents: totalCents,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      },
      status: 200
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});