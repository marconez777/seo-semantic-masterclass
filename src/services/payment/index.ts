// Neutral payment service facade
// Uses Abacate Pay via Edge Function when available; falls back to manual mode otherwise.

import { supabase } from '@/integrations/supabase/client';

export type CheckoutResult = {
  url: string;
  mode: 'manual' | 'redirect';
};

export async function createCheckout(orders: any[], customer?: { name?: string; phone?: string; cpf?: string; email?: string; }): Promise<CheckoutResult> {
  // Map generic orders to Abacate Pay products shape
  const products = (orders ?? []).map((o: any) => ({
    externalId: String(o?.externalId ?? o?.id ?? crypto.randomUUID()),
    name: String(o?.name ?? 'Item'),
    description: o?.description ?? undefined,
    quantity: Number(o?.quantity ?? 1),
    price: Number(o?.price_cents ?? o?.priceCents ?? o?.price ?? 0), // in cents
  }));

  const { data, error } = await supabase.functions.invoke('abacate-create-billing', {
    body: {
      frequency: 'MULTIPLE_PAYMENTS',
      methods: ['PIX'],
      products,
      customer: customer
        ? {
            name: customer.name,
            cellphone: (customer as any).cellphone ?? customer.phone,
            email: customer.email,
            taxId: (customer as any).taxId ?? customer.cpf,
          }
        : undefined,
      // Frontend routes for navigation
      returnUrl: `${window.location.origin}/carrinho`,
      completionUrl: `${window.location.origin}/painel`,
    },
  });

  if (error) {
    console.error('Checkout error:', error);
    return { url: '#', mode: 'manual' };
  }

  const url = (data?.url ?? data?.data?.url) as string | undefined;
  return { url: url ?? '#', mode: 'redirect' };
}
