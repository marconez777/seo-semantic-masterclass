import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";
import FAQSection from "@/components/seo/FAQSection";

const faqs = [
  {
    question: "O que são backlinks e por que são importantes?",
    answer: "Backlinks são links de outros sites que apontam para o seu. Eles são um dos principais fatores de ranqueamento do Google, pois indicam que seu site é confiável e relevante."
  },
  {
    question: "Qual a diferença entre DA e DR?",
    answer: "DA (Domain Authority) é uma métrica da Moz que indica a autoridade de um domínio. DR (Domain Rating) é a métrica equivalente da Ahrefs. Ambas variam de 0 a 100."
  },
  {
    question: "Como funciona o processo de compra?",
    answer: "Você escolhe os sites desejados, adiciona ao carrinho e finaliza o pagamento via PIX ou cartão. Após confirmação, produzimos o conteúdo com seu link e publicamos no site escolhido."
  },
  {
    question: "Quanto tempo leva para o link ser publicado?",
    answer: "O prazo médio é de 7 a 15 dias úteis após a confirmação do pagamento, dependendo do portal escolhido e da aprovação do conteúdo."
  },
  {
    question: "Os links são permanentes?",
    answer: "Sim, todos os nossos backlinks são permanentes e do tipo dofollow, garantindo transferência de autoridade para o seu site."
  }
];

export default function ComprarBacklinks() {
  return (
    <>
      <SEOHead
        title="Comprar Backlinks de em Grandes Portais | MK"
        description="Comprar Backlinks de qualidade no Nicho que você escolher. Apareça no Topo do Google e nas Respostas das IAs."
        canonicalUrl="https://mkart.com.br/comprar-backlinks"
        keywords="comprar backlinks, link building, DR, DA, tráfego, preço"
      />
      <CategoryStructuredData
        categoryName="Comprar Backlinks"
        categoryUrl="https://mkart.com.br/comprar-backlinks"
        backlinks={[]}
        description="Compre backlinks de qualidade em grandes portais brasileiros. Links com alta autoridade para melhorar seu posicionamento no Google."
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          showCategoryGrid={true}
          seoContent={
            <div className="mt-12 space-y-8">
              <section className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold mb-4">Por que comprar backlinks de qualidade?</h2>
                <p className="text-muted-foreground">
                  Os backlinks são um dos principais fatores de ranqueamento do Google. Quando sites de alta autoridade 
                  linkam para o seu, você ganha credibilidade e melhora sua posição nos resultados de busca. 
                  Nossa plataforma oferece backlinks em portais verificados com métricas reais.
                </p>
              </section>
              <FAQSection 
                faqs={faqs}
                title="Perguntas Frequentes sobre Backlinks"
              />
            </div>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">Comprar Backlinks em Grandes Portais</h1>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
