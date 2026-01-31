import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksNoticias() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Notícias | MK"
        description="Comprar Backlinks de qualidade em Portais de Notícias. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-noticias"
        keywords="comprar backlinks notícias, backlinks jornais, backlinks portais, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Notícias", url: "https://mkart.com.br/comprar-backlinks-noticias" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Notícias"
        categoryUrl="https://mkart.com.br/comprar-backlinks-noticias"
        backlinks={[]}
        description="Compre backlinks de qualidade em grandes portais de notícias. Links com alta autoridade para aumentar sua credibilidade."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Notícias"
          showCategoryGrid={true}
          currentCategorySlug="noticias"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Por que Comprar Backlinks em Portais de Notícias?</h2>
              <p className="text-muted-foreground">
                Portais de notícias têm alta autoridade de domínio. Backlinks nestes sites transferem credibilidade e melhoram significativamente seu posicionamento no Google.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de grandes portais jornalísticos e de notícias, garantindo máxima transferência de autoridade.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Notícias', url: '/comprar-backlinks-noticias' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks em Portais de Notícias</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Alta Autoridade em Grandes Portais</h2>
          <p className="text-muted-foreground mb-8">Aumente a credibilidade do seu site com links em portais de notícias.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
