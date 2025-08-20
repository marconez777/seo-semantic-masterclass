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
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.products) || body.products.length === 0) {
      console.error('Invalid request body or no products');
      return new Response(
        JSON.stringify({ error: 'Invalid request: products required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Calculate total
    const totalCents = body.products.reduce((sum: number, product: any) => {
      const quantity = Number(product.quantity) || 0;
      const price = Number(product.price) || 0;
      return sum + (quantity * price);
    }, 0);

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

    // Insert customer PII (if available)
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const customer = body.customer || {};
    const userMeta = user.user_metadata || {};
    
    await supabaseService.rpc('insert_encrypted_pii_secure', {
      p_order_id: order.id,
      p_customer_email: user.email || customer.email || null,
      p_customer_name: customer.name || userMeta.name || userMeta.full_name || null,
      p_customer_cpf: customer.cpf || userMeta.cpf || null,
      p_customer_phone: customer.phone || userMeta.phone || null,
    }).catch(err => console.error('PII insert error:', err));

    // Insert order items
    const metaItems = body.metadata?.items || [];
    const metaMap = new Map();
    metaItems.forEach((item: any) => {
      if (item.externalId) {
        metaMap.set(item.externalId, item);
      }
    });

    const orderItems = body.products.map((product: any) => {
      const meta = metaMap.get(product.externalId) || {};
      return {
        order_id: order.id,
        backlink_id: product.externalId || '',
        quantity: Number(product.quantity) || 1,
        price_cents: Number(product.price) || 0,
        anchor_text: meta.anchorText || null,
        target_url: meta.targetUrl || null,
      };
    });

    await supabaseUser
      .from('order_items')
      .insert(orderItems)
      .catch(err => console.error('Order items insert error:', err));

    console.log(`Order ${order.id} completed successfully`);

    return new Response(
      JSON.stringify({
        ok: true,
        orderId: order.id,
        mode: 'manual'
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});