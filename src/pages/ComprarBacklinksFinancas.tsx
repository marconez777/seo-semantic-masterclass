import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksFinancas() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Finanças | MK"
        description="Comprar Backlinks de qualidade no Nicho de Finanças. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-financas"
        keywords="comprar backlinks finanças, backlinks investimentos, backlinks bancos, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Finanças", url: "https://mkart.com.br/comprar-backlinks-financas" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Finanças"
        categoryUrl="https://mkart.com.br/comprar-backlinks-financas"
        backlinks={[]}
        description="Compre backlinks de qualidade em portais financeiros. Links com alta autoridade para fintechs e sites de investimentos."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Finanças"
          showCategoryGrid={true}
          currentCategorySlug="financas"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Finanças?</h2>
              <p className="text-muted-foreground">
                O setor financeiro exige alta credibilidade. Backlinks de qualidade em portais de finanças e economia são essenciais para construir autoridade no Google.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de sites especializados em finanças, investimentos e economia, garantindo relevância temática para sua estratégia de SEO.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Finanças', url: '/comprar-backlinks-financas' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Finanças</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho Financeiro</h2>
          <p className="text-muted-foreground mb-8">Construa autoridade para sua fintech ou site de investimentos.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
