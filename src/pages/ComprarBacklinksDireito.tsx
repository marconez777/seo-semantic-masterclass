import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksDireito() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Direito e Advocacia | MK"
        description="Comprar Backlinks de qualidade no Nicho Jurídico. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-direito"
        keywords="comprar backlinks direito, backlinks advocacia, backlinks jurídico, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Direito", url: "https://mkart.com.br/comprar-backlinks-direito" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Direito"
        categoryUrl="https://mkart.com.br/comprar-backlinks-direito"
        backlinks={[]}
        description="Compre backlinks de qualidade em portais jurídicos. Links com alta autoridade para escritórios de advocacia."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Direito"
          showCategoryGrid={true}
          currentCategorySlug="direito"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Direito?</h2>
              <p className="text-muted-foreground">
                O mercado jurídico online é altamente competitivo. Para destacar seu escritório de advocacia, é essencial investir em backlinks de qualidade em portais especializados.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de sites jurídicos, portais de notícias do direito e blogs especializados, garantindo relevância temática para sua estratégia de SEO.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Direito', url: '/comprar-backlinks-direito' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Direito</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho Jurídico</h2>
          <p className="text-muted-foreground mb-8">Destaque seu escritório de advocacia no topo do Google com backlinks de alta autoridade.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
