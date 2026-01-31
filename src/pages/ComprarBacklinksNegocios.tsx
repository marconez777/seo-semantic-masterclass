import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksNegocios() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Negócios | MK"
        description="Comprar Backlinks de qualidade no Nicho de Negócios. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-negocios"
        keywords="comprar backlinks negócios, backlinks empresas, backlinks B2B, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Negócios", url: "https://mkart.com.br/comprar-backlinks-negocios" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Negócios"
        categoryUrl="https://mkart.com.br/comprar-backlinks-negocios"
        backlinks={[]}
        description="Compre backlinks de qualidade em portais de negócios. Links com alta autoridade para empresas e startups."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Negócios"
          showCategoryGrid={true}
          currentCategorySlug="negocios"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Negócios?</h2>
              <p className="text-muted-foreground">
                O ambiente empresarial exige credibilidade. Backlinks de qualidade em portais de negócios são essenciais para startups e empresas que buscam autoridade online.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de sites especializados em empreendedorismo, economia e gestão, garantindo relevância temática.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Negócios', url: '/comprar-backlinks-negocios' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Negócios</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho Empresarial</h2>
          <p className="text-muted-foreground mb-8">Construa autoridade para sua empresa ou startup no topo do Google.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
