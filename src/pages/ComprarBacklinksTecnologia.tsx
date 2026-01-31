import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksTecnologia() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Tecnologia | MK"
        description="Comprar Backlinks de qualidade no Nicho de Tecnologia. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-tecnologia"
        keywords="comprar backlinks tecnologia, backlinks tech, backlinks software, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Tecnologia", url: "https://mkart.com.br/comprar-backlinks-tecnologia" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Tecnologia"
        categoryUrl="https://mkart.com.br/comprar-backlinks-tecnologia"
        backlinks={[]}
        description="Compre backlinks de qualidade em portais de tecnologia. Links com alta autoridade para startups e empresas de software."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Tecnologia"
          showCategoryGrid={true}
          currentCategorySlug="tecnologia"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Tecnologia?</h2>
              <p className="text-muted-foreground">
                O setor de tecnologia é inovador e competitivo. Backlinks de qualidade em portais tech são essenciais para startups, SaaS e empresas de software.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de sites especializados em tecnologia, inovação e negócios digitais, garantindo relevância temática.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Tecnologia', url: '/comprar-backlinks-tecnologia' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Tecnologia</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho Tech</h2>
          <p className="text-muted-foreground mb-8">Destaque sua startup ou empresa de software no topo do Google.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
