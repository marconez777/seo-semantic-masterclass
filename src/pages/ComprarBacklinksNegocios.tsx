import DynamicCategoryPage from "@/components/marketplace/DynamicCategoryPage";

export default function ComprarBacklinksNegocios() {
  return (
    <DynamicCategoryPage
      pageSlug="comprar-backlinks-negocios"
      categoryName="Negócios"
      categorySlug="negocios"
      fallback={{
        metaTitle: "Comprar Backlinks Brasileiros de Negócios | MK",
        metaDescription: "Comprar Backlinks de qualidade no Nicho de Negócios. Apareça no Topo do Google e nas Respostas das IAs.",
        metaKeywords: "comprar backlinks negócios, backlinks empresas, backlinks B2B, DR, DA, tráfego",
        canonicalUrl: "https://mkart.com.br/comprar-backlinks-negocios",
        h1Title: "Backlinks para Negócios",
        h2Subtitle: "Compre Backlinks de Qualidade para o nicho Empresarial",
        introText: "Construa autoridade para sua empresa ou startup no topo do Google.",
        seoContent: (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Negócios?</h2>
            <p className="text-muted-foreground">
              O ambiente empresarial exige credibilidade. Backlinks de qualidade em portais de negócios são essenciais para startups e empresas que buscam autoridade online.
            </p>
            <p className="text-muted-foreground">
              Nossos backlinks são provenientes de sites especializados em empreendedorismo, economia e gestão, garantindo relevância temática.
            </p>
          </section>
        ),
      }}
    />
  );
}
