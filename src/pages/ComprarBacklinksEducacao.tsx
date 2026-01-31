import DynamicCategoryPage from "@/components/marketplace/DynamicCategoryPage";

export default function ComprarBacklinksEducacao() {
  return (
    <DynamicCategoryPage
      pageSlug="comprar-backlinks-educacao"
      categoryName="Educação"
      categorySlug="educacao"
      fallback={{
        metaTitle: "Comprar Backlinks Brasileiros de Educação | MK",
        metaDescription: "Comprar Backlinks de qualidade no Nicho de Educação. Apareça no Topo do Google e nas Respostas das IAs.",
        metaKeywords: "comprar backlinks educação, backlinks cursos, backlinks escolas, DR, DA, tráfego",
        canonicalUrl: "https://mkart.com.br/comprar-backlinks-educacao",
        h1Title: "Backlinks para Educação",
        h2Subtitle: "Compre Backlinks de Qualidade para o nicho Educacional",
        introText: "Destaque sua escola ou curso online no topo do Google com backlinks de alta autoridade.",
        seoContent: (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold">Backlinks Brasileiros para o Nicho de Educação</h2>
            <p className="text-muted-foreground">
              Apareça nas respostas das IAs e no topo do Google com a autoridade dos nossos backlinks!
            </p>
            <p className="text-muted-foreground">
              O setor educacional online está em constante crescimento. Backlinks de qualidade em portais educacionais são essenciais para destacar sua instituição de ensino ou curso online.
            </p>
          </section>
        ),
      }}
    />
  );
}
