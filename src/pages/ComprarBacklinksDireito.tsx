import DynamicCategoryPage from "@/components/marketplace/DynamicCategoryPage";

export default function ComprarBacklinksDireito() {
  return (
    <DynamicCategoryPage
      pageSlug="comprar-backlinks-direito"
      categoryName="Direito"
      categorySlug="direito"
      fallback={{
        metaTitle: "Comprar Backlinks Brasileiros de Direito e Advocacia | MK",
        metaDescription: "Comprar Backlinks de qualidade no Nicho Jurídico. Apareça no Topo do Google e nas Respostas das IAs.",
        metaKeywords: "comprar backlinks direito, backlinks advocacia, backlinks jurídico, DR, DA, tráfego",
        canonicalUrl: "https://mkart.com.br/comprar-backlinks-direito",
        h1Title: "Backlinks para Direito",
        h2Subtitle: "Compre Backlinks de Qualidade para o nicho Jurídico",
        introText: "Destaque seu escritório de advocacia no topo do Google com backlinks de alta autoridade.",
        seoContent: (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Direito?</h2>
            <p className="text-muted-foreground">
              O mercado jurídico online é altamente competitivo. Para destacar seu escritório de advocacia, é essencial investir em backlinks de qualidade em portais especializados.
            </p>
            <p className="text-muted-foreground">
              Nossos backlinks são provenientes de sites jurídicos, portais de notícias do direito e blogs especializados, garantindo relevância temática para sua estratégia de SEO.
            </p>
          </section>
        ),
      }}
    />
  );
}
