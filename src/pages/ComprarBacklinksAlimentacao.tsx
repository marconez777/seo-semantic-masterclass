import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksAlimentacao() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Alimentação e Gastronomia | MK"
        description="Comprar Backlinks de qualidade no Nicho de Gastronomia e Alimentação. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-alimentacao"
        keywords="comprar backlinks alimentação, backlinks gastronomia, DR, DA, tráfego, preço"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Alimentação", url: "https://mkart.com.br/comprar-backlinks-alimentacao" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Alimentação"
        categoryUrl="https://mkart.com.br/comprar-backlinks-alimentacao"
        backlinks={[]}
        description="Compre backlinks de qualidade em blogs e portais de gastronomia e alimentação. Links com alta autoridade para melhorar seu SEO."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Alimentação"
          showCategoryGrid={true}
          currentCategorySlug="alimentacao"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Compre Backlinks de Qualidade para o Nicho de Gastronomia e Alimentação</h2>
              <p className="text-muted-foreground">
                O setor de alimentação e gastronomia é altamente competitivo online. Para destacar seu restaurante, blog de receitas ou e-commerce de alimentos, backlinks de qualidade são essenciais.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de portais especializados em gastronomia, nutrição e culinária, garantindo relevância temática para sua estratégia de SEO.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Alimentação', url: '/comprar-backlinks-alimentacao' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Alimentação</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho de Gastronomia</h2>
          <p className="text-muted-foreground mb-8">Apareça com seu restaurante ou blog de receitas no topo do Google e também nas respostas das principais inteligências artificiais.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
