
// Neutral payment service facade
// Uses Abacate Pay via Edge Function when available; falls back to manual mode otherwise.

import { supabase } from '@/integrations/supabase/client';

export type CheckoutResult = {
  url?: string;
  mode: 'manual' | 'redirect';
  orderId?: string;
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

export async function createCheckout(orders: OrderInput[], customer?: { name?: string; phone?: string; cpf?: string; email?: string; }): Promise<CheckoutResult> {
  // Map generic orders to Abacate Pay products shape
  const products = (orders ?? []).map((o: OrderInput) => ({
    externalId: String(o?.externalId ?? o?.id ?? crypto.randomUUID()),
    name: String(o?.name ?? 'Item'),
    description: o?.description ?? undefined,
    quantity: Number(o?.quantity ?? 1),
    price: Number(o?.price_cents ?? o?.priceCents ?? o?.price ?? 0), // in cents
  }));

  // Provide metadata to also persist anchor/target per item
  const metaItems = (orders ?? []).map((o: OrderInput) => ({
    externalId: String(o?.externalId ?? o?.id ?? ''),
    anchorText: o?.anchorText,
    targetUrl: o?.targetUrl,
  }));

  const { data, error } = await supabase.functions.invoke('manual-create-order', {
    body: {
      products,
      customer: customer?.name
        ? {
            name: String(customer.name),
            phone: customer.phone,
            email: customer.email,
            cpf: customer.cpf,
          }
        : undefined,
      metadata: {
        items: metaItems,
      },
    },
  });

  if (error) {
    console.error('Checkout error:', error);
    return { mode: 'manual' };
  }

  const orderId = data?.orderId;
  return { mode: 'manual', orderId };
}
