import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksEsportes() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Esportes | MK"
        description="Comprar Backlinks de qualidade no Nicho de Esportes. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-esportes"
        keywords="comprar backlinks esportes, backlinks fitness, backlinks academias, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Esportes", url: "https://mkart.com.br/comprar-backlinks-esportes" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Esportes"
        categoryUrl="https://mkart.com.br/comprar-backlinks-esportes"
        backlinks={[]}
        description="Compre backlinks de qualidade em portais esportivos. Links com alta autoridade para academias e sites de fitness."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Esportes"
          showCategoryGrid={true}
          currentCategorySlug="esportes"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Esportes?</h2>
              <p className="text-muted-foreground">
                O mercado de esportes e fitness é altamente competitivo. Backlinks de qualidade em portais esportivos são essenciais para destacar sua academia, loja de suplementos ou blog de fitness.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de sites especializados em esportes, saúde e bem-estar, garantindo relevância temática para sua estratégia de SEO.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Esportes', url: '/comprar-backlinks-esportes' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Esportes</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho Esportivo</h2>
          <p className="text-muted-foreground mb-8">Destaque sua academia ou loja de esportes no topo do Google.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
