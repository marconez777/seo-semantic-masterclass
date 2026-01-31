import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";

export default function ComprarBacklinksEducacao() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks Brasileiros de Educação | MK"
        description="Comprar Backlinks de qualidade no Nicho de Educação. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks-educacao"
        keywords="comprar backlinks educação, backlinks cursos, backlinks escolas, DR, DA, tráfego"
      />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: "Backlinks de Educação", url: "https://mkart.com.br/comprar-backlinks-educacao" },
          ],
        }}
      />
      <CategoryStructuredData
        categoryName="Backlinks de Educação"
        categoryUrl="https://mkart.com.br/comprar-backlinks-educacao"
        backlinks={[]}
        description="Compre backlinks de qualidade em portais educacionais. Links com alta autoridade para escolas e cursos online."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category="Educação"
          showCategoryGrid={true}
          currentCategorySlug="educacao"
          seoContent={
            <section className="mt-10 space-y-4">
              <h2 className="text-2xl font-semibold">Backlinks Brasileiros para o Nicho de Educação</h2>
              <p className="text-muted-foreground">
                Apareça nas respostas das IAs e no topo do Google com a autoridade dos nossos backlinks!
              </p>
              <p className="text-muted-foreground">
                O setor educacional online está em constante crescimento. Backlinks de qualidade em portais educacionais são essenciais para destacar sua instituição de ensino ou curso online.
              </p>
            </section>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: 'Educação', url: '/comprar-backlinks-educacao' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Backlinks para Educação</h1>
          <h2 className="text-2xl font-semibold mb-6">Compre Backlinks de Qualidade para o nicho Educacional</h2>
          <p className="text-muted-foreground mb-8">Destaque sua escola ou curso online no topo do Google com backlinks de alta autoridade.</p>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
