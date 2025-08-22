// Manual payment service for PIX payments
import { supabase } from '@/integrations/supabase/client';

export type CheckoutResult = {
  url?: string;
  mode: 'manual' | 'redirect';
  orderId?: string;
  error?: string;
};

type OrderInput = {
  id?: string;
  externalId?: string;
  name: string;
  description?: string;
  quantity: number;
  price_cents?: number;
  priceCents?: number;
  price?: number;
  anchorText?: string;
  targetUrl?: string;
};

export async function createCheckout(
  orders: OrderInput[], 
  customer?: { 
    name?: string; 
    phone?: string; 
    cpf?: string; 
    email?: string; 
  }
): Promise<CheckoutResult> {
  try {
    console.log('=== CHECKOUT START ===');
    console.log('Orders:', orders);
    console.log('Customer:', customer);

    // Validate input
    if (!orders || orders.length === 0) {
      throw new Error('No orders provided');
    }

    // Map orders to products format
    const products = orders.map((order) => ({
      externalId: String(order.externalId || order.id || crypto.randomUUID()),
      name: String(order.name || 'Item'),
      description: order.description || undefined,
      quantity: Number(order.quantity || 1),
      price: Number(order.price_cents || order.priceCents || order.price || 0), // in cents
    }));

    // Map metadata for anchor text and target URL
    const metaItems = orders.map((order) => ({
      externalId: String(order.externalId || order.id || ''),
      anchorText: order.anchorText,
      targetUrl: order.targetUrl,
    }));

    const requestBody = {
      products,
      customer: customer?.name ? {
        name: String(customer.name),
        phone: customer.phone,
        email: customer.email,
        cpf: customer.cpf,
      } : undefined,
      metadata: {
        items: metaItems,
      },
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User not authenticated");
    }

    // Call edge function
    const { data, error } = await supabase.functions.invoke('manual-create-order', {
      body: requestBody,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      }
    });

    console.log('Function response:', { data, error });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Checkout failed: ${error.message || 'Unknown error'}`);
    }

    if (!data || !data.ok || !data.orderId) {
      console.error('Invalid response data:', data);
      throw new Error('Invalid response from server');
    }

    console.log('=== CHECKOUT SUCCESS ===');
    console.log('Order ID:', data.orderId);

    return {
      mode: 'manual',
      orderId: data.orderId,
    };

  } catch (error) {
    console.error('=== CHECKOUT ERROR ===');
    console.error('Error details:', error);
    
    return {
      mode: 'manual',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}