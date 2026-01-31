import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksMarketing() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Marketing | MK"
        description="Comprar Backlinks de qualidade no Nicho de Marketing Digital. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-marketing"
        keywords="comprar backlinks marketing, backlinks marketing digital, backlinks agências, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Marketing", url: "https://mkart.com.br/comprar-backlinks-marketing" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Marketing"
        categoryUrl="https://mkart.com.br/comprar-backlinks-marketing"
        backlinks={[]}
        description="Compre backlinks de qualidade em portais de marketing digital. Links com alta autoridade para agências e profissionais."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Marketing"
          showCategoryGrid={true}
          currentCategorySlug="marketing"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Por que Comprar Backlinks para Marketing?</h2>
              <p className="text-muted-foreground">
                Agências de marketing e profissionais de SEO sabem a importância de backlinks de qualidade. Destaque sua agência ou blog de marketing com links de alta autoridade.
              </p>
              <p className="text-muted-foreground">
                Nossos backlinks são provenientes de portais especializados em marketing digital, publicidade e negócios, garantindo relevância temática.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Marketing', url: '/comprar-backlinks-marketing' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Marketing</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho de Marketing Digital</h2>
          <p className="text-muted-foreground mb-8">Destaque sua agência ou blog de marketing no topo do Google.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
