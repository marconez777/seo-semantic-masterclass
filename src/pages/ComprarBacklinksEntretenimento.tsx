import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksEntretenimento() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Entretenimento | MK"
        description="Comprar Backlinks de qualidade no Nicho de Entretenimento. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-entretenimento"
        keywords="comprar backlinks entretenimento, backlinks games, backlinks música, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Entretenimento", url: "https://mkart.com.br/comprar-backlinks-entretenimento" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Entretenimento"
        categoryUrl="https://mkart.com.br/comprar-backlinks-entretenimento"
        backlinks={[]}
        description="Compre backlinks de qualidade em portais de entretenimento. Links com alta autoridade para sites de games, música e cultura."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Entretenimento"
          showCategoryGrid={true}
          currentCategorySlug="entretenimento"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Entretenimento?</h2>
              <p className="text-muted-foreground">
                O setor de entretenimento é dinâmico e engajado. Backlinks de qualidade em portais de games, música e cultura são essenciais para sites deste nicho.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de sites especializados em entretenimento, garantindo relevância temática para sua estratégia de SEO.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Entretenimento', url: '/comprar-backlinks-entretenimento' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Entretenimento</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho de Entretenimento</h2>
          <p className="text-muted-foreground mb-8">Destaque seu site de games, música ou cultura no topo do Google.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
