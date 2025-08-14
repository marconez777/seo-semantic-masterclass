import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PIIData {
  order_id: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_cpf: string | null;
  customer_phone: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create service role client
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // Verify user authentication with anon key client
    const supabaseAnon = createClient(
      supabaseUrl, 
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // Parse request body
    const { order_ids, single_order_id } = await req.json();

    let piiData: PIIData[] = [];

    if (single_order_id) {
      // Get single PII record
      // First verify user owns this order
      const { data: order, error: orderError } = await supabaseAnon
        .from('pedidos')
        .select('user_id')
        .eq('id', single_order_id)
        .single();

      if (orderError || !order) {
        return new Response('Order not found', { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      // Check if user is admin or owns the order
      const { data: userRole } = await supabaseAnon
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      const isAdmin = !!userRole;
      const ownsOrder = order.user_id === user.id;

      if (!isAdmin && !ownsOrder) {
        return new Response('Forbidden', { 
          status: 403, 
          headers: corsHeaders 
        });
      }

      // Get PII data using service role
      const { data, error } = await supabaseService
        .rpc('get_decrypted_pii_secure', { p_order_id: single_order_id });

      if (error) {
        console.error('Error fetching PII:', error);
        return new Response('Internal server error', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      piiData = data || [];

    } else if (order_ids && Array.isArray(order_ids)) {
      // Get multiple PII records (admin only)
      const { data: userRole } = await supabaseAnon
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!userRole) {
        return new Response('Forbidden: Admin access required', { 
          status: 403, 
          headers: corsHeaders 
        });
      }

      // Get multiple PII data using service role
      const { data, error } = await supabaseService
        .rpc('get_multiple_decrypted_pii_secure', { p_order_ids: order_ids });

      if (error) {
        console.error('Error fetching multiple PII:', error);
        return new Response('Internal server error', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      piiData = data || [];
    } else {
      return new Response('Invalid request: Provide single_order_id or order_ids', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    return new Response(JSON.stringify({ data: piiData }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error in get-pii-data function:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});