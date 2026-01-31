import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksTurismo() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Turismo | MK"
        description="Comprar Backlinks de qualidade no Nicho de Turismo. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-turismo"
        keywords="comprar backlinks turismo, backlinks viagens, backlinks hotéis, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Turismo", url: "https://mkart.com.br/comprar-backlinks-turismo" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Turismo"
        categoryUrl="https://mkart.com.br/comprar-backlinks-turismo"
        backlinks={[]}
        description="Compre backlinks de qualidade em portais de turismo. Links com alta autoridade para agências de viagens e hotéis."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Turismo"
          showCategoryGrid={true}
          currentCategorySlug="turismo"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Turismo?</h2>
              <p className="text-muted-foreground">
                O setor de turismo é altamente visual e competitivo. Backlinks de qualidade em portais de viagens são essenciais para agências, hotéis e blogs de viagem.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de sites especializados em turismo, viagens e hospitalidade, garantindo relevância temática para sua estratégia de SEO.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Turismo', url: '/comprar-backlinks-turismo' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Turismo</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho de Viagens</h2>
          <p className="text-muted-foreground mb-8">Destaque sua agência de viagens ou hotel no topo do Google.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
