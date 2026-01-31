import DynamicCategoryPage from "@/components/marketplace/DynamicCategoryPage";

export default function ComprarBacklinksNoticias() {
  return (
    <DynamicCategoryPage
      pageSlug="comprar-backlinks-noticias"
      categoryName="Notícias"
      categorySlug="noticias"
      fallback={{
        metaTitle: "Comprar Backlinks Brasileiros de Notícias | MK",
        metaDescription: "Comprar Backlinks de qualidade em Portais de Notícias. Apareça no Topo do Google e nas Respostas das IAs.",
        metaKeywords: "comprar backlinks notícias, backlinks jornais, backlinks portais, DR, DA, tráfego",
        canonicalUrl: "https://mkart.com.br/comprar-backlinks-noticias",
        h1Title: "Backlinks em Portais de Notícias",
        h2Subtitle: "Compre Backlinks de Alta Autoridade em Grandes Portais",
        introText: "Aumente a credibilidade do seu site com links em portais de notícias.",
        seoContent: (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold">Por que Comprar Backlinks em Portais de Notícias?</h2>
            <p className="text-muted-foreground">
              Portais de notícias têm alta autoridade de domínio. Backlinks nestes sites transferem credibilidade e melhoram significativamente seu posicionamento no Google.
            </p>
            <p className="text-muted-foreground">
              Nossos backlinks são provenientes de grandes portais jornalísticos e de notícias, garantindo máxima transferência de autoridade.
            </p>
          </section>
        ),
      }}
    />
  );
}
