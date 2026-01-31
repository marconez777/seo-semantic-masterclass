import DynamicCategoryPage from "@/components/marketplace/DynamicCategoryPage";

export default function ComprarBacklinksSaude() {
  return (
    <DynamicCategoryPage
      pageSlug="comprar-backlinks-saude"
      categoryName="Saúde"
      categorySlug="saude"
      fallback={{
        metaTitle: "Comprar Backlinks Brasileiros de Saúde | MK",
        metaDescription: "Comprar Backlinks de qualidade no Nicho de Saúde. Apareça no Topo do Google e nas Respostas das IAs.",
        metaKeywords: "comprar backlinks saúde, backlinks medicina, backlinks clínicas, DR, DA, tráfego",
        canonicalUrl: "https://mkart.com.br/comprar-backlinks-saude",
        h1Title: "Backlinks para Saúde",
        h2Subtitle: "Compre Backlinks de Qualidade para o nicho de Saúde",
        introText: "Construa autoridade para sua clínica ou site de saúde.",
        seoContent: (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Saúde?</h2>
            <p className="text-muted-foreground">
              O setor de saúde exige alta credibilidade (YMYL). Backlinks de qualidade em portais especializados são essenciais para clínicas, médicos e farmácias.
            </p>
            <p className="text-muted-foreground">
              Nossos backlinks são provenientes de sites especializados em saúde e bem-estar, garantindo relevância temática e conformidade com as diretrizes do Google.
            </p>
          </section>
        ),
      }}
    />
  );
}
