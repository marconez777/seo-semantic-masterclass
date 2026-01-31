import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksSaude() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Saúde | MK"
        description="Comprar Backlinks de qualidade no Nicho de Saúde. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-saude"
        keywords="comprar backlinks saúde, backlinks medicina, backlinks clínicas, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Saúde", url: "https://mkart.com.br/comprar-backlinks-saude" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Saúde"
        categoryUrl="https://mkart.com.br/comprar-backlinks-saude"
        backlinks={[]}
        description="Compre backlinks de qualidade em portais de saúde. Links com alta autoridade para clínicas e profissionais de saúde."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Saúde"
          showCategoryGrid={true}
          currentCategorySlug="saude"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Saúde?</h2>
              <p className="text-muted-foreground">
                O setor de saúde exige alta credibilidade (YMYL). Backlinks de qualidade em portais especializados são essenciais para clínicas, médicos e farmácias.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de sites especializados em saúde e bem-estar, garantindo relevância temática e conformidade com as diretrizes do Google.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Saúde', url: '/comprar-backlinks-saude' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Saúde</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho de Saúde</h2>
          <p className="text-muted-foreground mb-8">Construa autoridade para sua clínica ou site de saúde.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
