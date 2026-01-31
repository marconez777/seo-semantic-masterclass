import DynamicCategoryPage from "@/components/marketplace/DynamicCategoryPage";

export default function ComprarBacklinksModa() {
  return (
    <DynamicCategoryPage
      pageSlug="comprar-backlinks-moda"
      categoryName="Moda"
      categorySlug="moda"
      fallback={{
        metaTitle: "Comprar Backlinks Brasileiros de Moda | MK",
        metaDescription: "Comprar Backlinks de qualidade no Nicho de Moda. Apareça no Topo do Google e nas Respostas das IAs.",
        metaKeywords: "comprar backlinks moda, backlinks fashion, backlinks roupas, DR, DA, tráfego",
        canonicalUrl: "https://mkart.com.br/comprar-backlinks-moda",
        h1Title: "Backlinks para Moda",
        h2Subtitle: "Compre Backlinks de Qualidade para o nicho de Moda",
        introText: "Destaque sua loja de moda ou blog de tendências no topo do Google.",
        seoContent: (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Moda?</h2>
            <p className="text-muted-foreground">
              O mercado de moda é visual e competitivo. Backlinks de qualidade em portais de moda são essenciais para e-commerces e blogs de tendências.
            </p>
            <p className="text-muted-foreground">
              Nossos backlinks são provenientes de sites especializados em moda, beleza e lifestyle, garantindo relevância temática para sua estratégia de SEO.
            </p>
          </section>
        ),
      }}
    />
  );
}
