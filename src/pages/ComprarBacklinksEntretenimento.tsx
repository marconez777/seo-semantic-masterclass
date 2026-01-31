import DynamicCategoryPage from "@/components/marketplace/DynamicCategoryPage";

export default function ComprarBacklinksEntretenimento() {
  return (
    <DynamicCategoryPage
      pageSlug="comprar-backlinks-entretenimento"
      categoryName="Entretenimento"
      categorySlug="entretenimento"
      fallback={{
        metaTitle: "Comprar Backlinks Brasileiros de Entretenimento | MK",
        metaDescription: "Comprar Backlinks de qualidade no Nicho de Entretenimento. Apareça no Topo do Google e nas Respostas das IAs.",
        metaKeywords: "comprar backlinks entretenimento, backlinks games, backlinks música, DR, DA, tráfego",
        canonicalUrl: "https://mkart.com.br/comprar-backlinks-entretenimento",
        h1Title: "Backlinks para Entretenimento",
        h2Subtitle: "Compre Backlinks de Qualidade para o nicho de Entretenimento",
        introText: "Destaque seu site de games, música ou cultura no topo do Google.",
        seoContent: (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Entretenimento?</h2>
            <p className="text-muted-foreground">
              O setor de entretenimento é dinâmico e engajado. Backlinks de qualidade em portais de games, música e cultura são essenciais para sites deste nicho.
            </p>
            <p className="text-muted-foreground">
              Nossos backlinks são provenientes de sites especializados em entretenimento, garantindo relevância temática para sua estratégia de SEO.
            </p>
          </section>
        ),
      }}
    />
  );
}
