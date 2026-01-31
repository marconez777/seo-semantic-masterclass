import DynamicCategoryPage from "@/components/marketplace/DynamicCategoryPage";

export default function ComprarBacklinksTurismo() {
  return (
    <DynamicCategoryPage
      pageSlug="comprar-backlinks-turismo"
      categoryName="Turismo"
      categorySlug="turismo"
      fallback={{
        metaTitle: "Comprar Backlinks Brasileiros de Turismo | MK",
        metaDescription: "Comprar Backlinks de qualidade no Nicho de Turismo. Apareça no Topo do Google e nas Respostas das IAs.",
        metaKeywords: "comprar backlinks turismo, backlinks viagens, backlinks hotéis, DR, DA, tráfego",
        canonicalUrl: "https://mkart.com.br/comprar-backlinks-turismo",
        h1Title: "Backlinks para Turismo",
        h2Subtitle: "Compre Backlinks de Qualidade para o nicho de Viagens",
        introText: "Destaque sua agência de viagens ou hotel no topo do Google.",
        seoContent: (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Turismo?</h2>
            <p className="text-muted-foreground">
              O setor de turismo é altamente visual e competitivo. Backlinks de qualidade em portais de viagens são essenciais para agências, hotéis e blogs de viagem.
            </p>
            <p className="text-muted-foreground">
              Nossos backlinks são provenientes de sites especializados em turismo, viagens e hospitalidade, garantindo relevância temática para sua estratégia de SEO.
            </p>
          </section>
        ),
      }}
    />
  );
}
