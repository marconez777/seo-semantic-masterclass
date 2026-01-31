import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksModa() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Moda | MK"
        description="Comprar Backlinks de qualidade no Nicho de Moda. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-moda"
        keywords="comprar backlinks moda, backlinks fashion, backlinks roupas, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Moda", url: "https://mkart.com.br/comprar-backlinks-moda" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Moda"
        categoryUrl="https://mkart.com.br/comprar-backlinks-moda"
        backlinks={[]}
        description="Compre backlinks de qualidade em portais de moda. Links com alta autoridade para e-commerces e blogs de moda."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Moda"
          showCategoryGrid={true}
          currentCategorySlug="moda"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Moda?</h2>
              <p className="text-muted-foreground">
                O mercado de moda é visual e competitivo. Backlinks de qualidade em portais de moda são essenciais para e-commerces e blogs de tendências.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de sites especializados em moda, beleza e lifestyle, garantindo relevância temática para sua estratégia de SEO.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Moda', url: '/comprar-backlinks-moda' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Moda</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho de Moda</h2>
          <p className="text-muted-foreground mb-8">Destaque sua loja de moda ou blog de tendências no topo do Google.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
