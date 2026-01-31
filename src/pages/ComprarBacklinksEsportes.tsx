import DynamicCategoryPage from "@/components/marketplace/DynamicCategoryPage";

export default function ComprarBacklinksEsportes() {
  return (
    <DynamicCategoryPage
      pageSlug="comprar-backlinks-esportes"
      categoryName="Esportes"
      categorySlug="esportes"
      fallback={{
        metaTitle: "Comprar Backlinks Brasileiros de Esportes | MK",
        metaDescription: "Comprar Backlinks de qualidade no Nicho de Esportes. Apareça no Topo do Google e nas Respostas das IAs.",
        metaKeywords: "comprar backlinks esportes, backlinks fitness, backlinks academias, DR, DA, tráfego",
        canonicalUrl: "https://mkart.com.br/comprar-backlinks-esportes",
        h1Title: "Backlinks para Esportes",
        h2Subtitle: "Compre Backlinks de Qualidade para o nicho Esportivo",
        introText: "Destaque sua academia ou loja de esportes no topo do Google.",
        seoContent: (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Esportes?</h2>
            <p className="text-muted-foreground">
              O mercado de esportes e fitness é altamente competitivo. Backlinks de qualidade em portais esportivos são essenciais para destacar sua academia, loja de suplementos ou blog de fitness.
            </p>
            <p className="text-muted-foreground">
              Nossos backlinks são provenientes de sites especializados em esportes, saúde e bem-estar, garantindo relevância temática para sua estratégia de SEO.
            </p>
          </section>
        ),
      }}
    />
  );
}
