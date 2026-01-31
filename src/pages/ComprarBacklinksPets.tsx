import DynamicCategoryPage from "@/components/marketplace/DynamicCategoryPage";

export default function ComprarBacklinksPets() {
  return (
    <DynamicCategoryPage
      pageSlug="comprar-backlinks-pets"
      categoryName="Pets"
      categorySlug="pets"
      fallback={{
        metaTitle: "Comprar Backlinks Brasileiros de Pets | MK",
        metaDescription: "Comprar Backlinks de qualidade no Nicho de Pets. Apareça no Topo do Google e nas Respostas das IAs.",
        metaKeywords: "comprar backlinks pets, backlinks animais, backlinks pet shop, DR, DA, tráfego",
        canonicalUrl: "https://mkart.com.br/comprar-backlinks-pets",
        h1Title: "Backlinks para Pets",
        h2Subtitle: "Compre Backlinks de Qualidade para o nicho Pet",
        introText: "Destaque seu pet shop ou clínica veterinária no topo do Google.",
        seoContent: (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Pets?</h2>
            <p className="text-muted-foreground">
              O mercado pet é apaixonado e engajado. Backlinks de qualidade em portais especializados são essenciais para pet shops, clínicas veterinárias e blogs de animais.
            </p>
            <p className="text-muted-foreground">
              Nossos backlinks são provenientes de sites especializados em animais de estimação, garantindo relevância temática para sua estratégia de SEO.
            </p>
          </section>
        ),
      }}
    />
  );
}
