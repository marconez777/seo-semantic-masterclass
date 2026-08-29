/**
 * Catálogo de pacotes de backlinks.
 *
 * Fonte única de verdade: cards, página de finalização, criação do pedido e
 * e-mails leem daqui. A edge function `create-package-order` mantém uma cópia
 * própria deste catálogo para recalcular o total no servidor — se um preço
 * mudar aqui, ele precisa mudar lá também.
 *
 * Esta modalidade é separada da loja avulsa (/comprar-backlinks): prazo,
 * pagamento e regras são diferentes e não compartilham o carrinho.
 */

export const WHATSAPP_NUMBER = "5511989151997";

/**
 * Dados do PIX exibidos na pagina de finalizacao do pacote.
 * Mesmos dados do e-mail de pagamento da compra avulsa
 * (supabase/functions/send-payment-email/_templates/payment-email.tsx).
 */
export const PIX_INFO = {
  keyType: "CNPJ",
  key: "54.128.027/0001-93",
  holder: "Keila de Oliveira Castellini",
};

export type PackageCtaType = "checkout" | "whatsapp";

export interface BacklinkPackage {
  slug: string;
  name: string;
  /** Quantidade de backlinks entregues no pacote */
  quantity: number | null;
  daMin: number | null;
  daMax: number | null;
  /** Preço do pacote em reais. null = sob consulta */
  price: number | null;
  /**
   * Preço do serviço "a MK escolhe as âncoras" em reais.
   * 0 = incluso no pacote. null = não se aplica.
   */
  anchorServicePrice: number | null;
  /** Prazo de entrega exibido ao cliente */
  deliveryLabel: string;
  badge?: string;
  highlight: boolean;
  ctaLabel: string;
  ctaType: PackageCtaType;
}

export const BACKLINK_PACKAGES: BacklinkPackage[] = [
  {
    slug: "basico",
    name: "Básico",
    quantity: 20,
    daMin: 20,
    daMax: 30,
    price: 197,
    anchorServicePrice: 97,
    deliveryLabel: "1 a 3 dias úteis",
    highlight: false,
    ctaLabel: "Comprar",
    ctaType: "checkout",
  },
  {
    slug: "medio",
    name: "Médio",
    quantity: 20,
    daMin: 30,
    daMax: 40,
    price: 497,
    anchorServicePrice: 0,
    deliveryLabel: "1 a 3 dias úteis",
    badge: "Mais vendido",
    highlight: true,
    ctaLabel: "Comprar",
    ctaType: "checkout",
  },
  {
    slug: "personalizado",
    name: "Personalizado",
    quantity: null,
    daMin: null,
    daMax: null,
    price: null,
    anchorServicePrice: null,
    deliveryLabel: "prazo a combinar",
    highlight: false,
    ctaLabel: "Falar no WhatsApp",
    ctaType: "whatsapp",
  },
];

/** Pacotes que possuem página de finalização própria */
export const CHECKOUT_PACKAGES = BACKLINK_PACKAGES.filter(
  (p) => p.ctaType === "checkout"
);

export function getPackageBySlug(slug?: string): BacklinkPackage | undefined {
  if (!slug) return undefined;
  return BACKLINK_PACKAGES.find((p) => p.slug === slug);
}

export function packageCheckoutPath(pkg: BacklinkPackage): string {
  return `/pacote-backlinks/${pkg.slug}`;
}

export function brl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Total do pedido em reais, considerando o opcional de âncoras */
export function packageTotal(pkg: BacklinkPackage, withAnchorService: boolean): number {
  const base = pkg.price ?? 0;
  if (!withAnchorService) return base;
  return base + (pkg.anchorServicePrice ?? 0);
}

export function packageWhatsAppUrl(pkg: BacklinkPackage): string {
  const message =
    pkg.ctaType === "whatsapp"
      ? "Olá! Quero montar um pacote de backlinks personalizado."
      : `Olá! Tenho dúvidas sobre o pacote ${pkg.name} de backlinks.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
