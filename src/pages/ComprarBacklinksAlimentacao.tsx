import DynamicCategoryPage from "@/components/marketplace/DynamicCategoryPage";

export default function ComprarBacklinksAlimentacao() {
  return (
    <DynamicCategoryPage
      pageSlug="comprar-backlinks-alimentacao"
      categoryName="Alimentação"
      categorySlug="alimentacao"
      fallback={{
        metaTitle: "Comprar Backlinks Brasileiros de Alimentação e Gastronomia | MK",
        metaDescription: "Comprar Backlinks de qualidade no Nicho de Gastronomia e Alimentação. Apareça no Topo do Google e nas Respostas das IAs.",
        metaKeywords: "comprar backlinks alimentação, backlinks gastronomia, DR, DA, tráfego, preço",
        canonicalUrl: "https://mkart.com.br/comprar-backlinks-alimentacao",
        h1Title: "Backlinks para Alimentação",
        h2Subtitle: "Compre Backlinks de Qualidade para o nicho de Gastronomia",
        introText: "Apareça com seu restaurante ou blog de receitas no topo do Google e também nas respostas das principais inteligências artificiais.",
        seoContent: (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold">Compre Backlinks de Qualidade para o Nicho de Gastronomia e Alimentação</h2>
            <p className="text-muted-foreground">
              O setor de alimentação e gastronomia é altamente competitivo online. Para destacar seu restaurante, blog de receitas ou e-commerce de alimentos, backlinks de qualidade são essenciais.
            </p>
            <p className="text-muted-foreground">
              Nossos backlinks são provenientes de portais especializados em gastronomia, nutrição e culinária, garantindo relevância temática para sua estratégia de SEO.
            </p>
          </section>
        ),
      }}
    />
  );
}
