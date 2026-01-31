import DynamicCategoryPage from "@/components/marketplace/DynamicCategoryPage";

export default function ComprarBacklinksMarketing() {
  return (
    <DynamicCategoryPage
      pageSlug="comprar-backlinks-marketing"
      categoryName="Marketing"
      categorySlug="marketing"
      fallback={{
        metaTitle: "Comprar Backlinks Brasileiros de Marketing | MK",
        metaDescription: "Comprar Backlinks de qualidade no Nicho de Marketing Digital. Apareça no Topo do Google e nas Respostas das IAs.",
        metaKeywords: "comprar backlinks marketing, backlinks marketing digital, backlinks agências, DR, DA, tráfego",
        canonicalUrl: "https://mkart.com.br/comprar-backlinks-marketing",
        h1Title: "Backlinks para Marketing",
        h2Subtitle: "Compre Backlinks de Qualidade para o nicho de Marketing Digital",
        introText: "Destaque sua agência ou blog de marketing no topo do Google.",
        seoContent: (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Marketing?</h2>
            <p className="text-muted-foreground">
              Agências de marketing e profissionais de SEO sabem a importância de backlinks de qualidade. Destaque sua agência ou blog de marketing com links de alta autoridade.
            </p>
            <p className="text-muted-foreground">
              Nossos backlinks são provenientes de portais especializados em marketing digital, publicidade e negócios, garantindo relevância temática.
            </p>
          </section>
        ),
      }}
    />
  );
}
