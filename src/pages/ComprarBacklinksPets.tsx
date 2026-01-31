import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksPets() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Pets | MK"
        description="Comprar Backlinks de qualidade no Nicho de Pets. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-pets"
        keywords="comprar backlinks pets, backlinks animais, backlinks pet shop, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Pets", url: "https://mkart.com.br/comprar-backlinks-pets" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Pets"
        categoryUrl="https://mkart.com.br/comprar-backlinks-pets"
        backlinks={[]}
        description="Compre backlinks de qualidade em portais de pets. Links com alta autoridade para pet shops e clínicas veterinárias."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Pets"
          showCategoryGrid={true}
          currentCategorySlug="pets"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Pets?</h2>
              <p className="text-muted-foreground">
                O mercado pet é apaixonado e engajado. Backlinks de qualidade em portais especializados são essenciais para pet shops, clínicas veterinárias e blogs de animais.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de sites especializados em animais de estimação, garantindo relevância temática para sua estratégia de SEO.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Pets', url: '/comprar-backlinks-pets' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Pets</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho Pet</h2>
          <p className="text-muted-foreground mb-8">Destaque seu pet shop ou clínica veterinária no topo do Google.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
