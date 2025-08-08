// Neutral payment service facade
// For now, we run in manual mode without an online provider.

import { createCheckout as createCheckoutPlaceholder } from './providers/placeholder';

export type CheckoutResult = {
  url: string;
  mode: 'manual' | 'redirect';
};

// In the future, choose provider based on a flag.
// const PAYMENT_PROVIDER: 'none' | 'some-gateway' = 'none'

export async function createCheckout(orders: any[]): Promise<CheckoutResult> {
  // Currently using the placeholder (manual) provider
  return createCheckoutPlaceholder(orders);
}
