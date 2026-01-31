import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksMaternidade() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Maternidade | MK"
        description="Comprar Backlinks de qualidade no Nicho de Maternidade. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-maternidade"
        keywords="comprar backlinks maternidade, backlinks bebês, backlinks mães, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Maternidade", url: "https://mkart.com.br/comprar-backlinks-maternidade" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Maternidade"
        categoryUrl="https://mkart.com.br/comprar-backlinks-maternidade"
        backlinks={[]}
        description="Compre backlinks de qualidade em portais de maternidade. Links com alta autoridade para lojas de bebês e blogs de mães."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Maternidade"
          showCategoryGrid={true}
          currentCategorySlug="maternidade"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Maternidade?</h2>
              <p className="text-muted-foreground">
                O nicho de maternidade é altamente engajado. Backlinks de qualidade em portais especializados são essenciais para lojas de bebês e blogs de mães.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de sites especializados em maternidade, bebês e família, garantindo relevância temática para sua estratégia de SEO.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Maternidade', url: '/comprar-backlinks-maternidade' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Maternidade</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho de Maternidade</h2>
          <p className="text-muted-foreground mb-8">Destaque sua loja de bebês ou blog de mães no topo do Google.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
