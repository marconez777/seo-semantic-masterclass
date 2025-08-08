// Placeholder payment provider (manual checkout mode)
// Returns a URL to navigate after order creation.

export async function createCheckout(_orders: any[]) {
  return { url: '/painel', mode: 'manual' as const };
}
