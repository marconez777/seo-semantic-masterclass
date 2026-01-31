import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";
import FAQSection from "@/components/seo/FAQSection";
import { usePageSEOContent } from "@/hooks/usePageSEOContent";

const defaultFaqs = [
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
  const { data: seoData } = usePageSEOContent("comprar-backlinks");

  // Use dynamic data or fallback
  const metaTitle = seoData?.meta_title || "Comprar Backlinks de em Grandes Portais | MK";
  const metaDescription = seoData?.meta_description || "Comprar Backlinks de qualidade no Nicho que você escolher. Apareça no Topo do Google e nas Respostas das IAs.";
  const metaKeywords = seoData?.meta_keywords || "comprar backlinks, link building, DR, DA, tráfego, preço";
  const canonicalUrl = seoData?.canonical_url || "https://mkart.com.br/comprar-backlinks";
  const h1Title = seoData?.h1_title || "Comprar Backlinks em Grandes Portais";
  const mainContent = seoData?.main_content;
  const faqs = seoData?.faqs?.length ? seoData.faqs : defaultFaqs;

  return (
    <>
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        canonicalUrl={canonicalUrl}
        keywords={metaKeywords}
      />
      <CategoryStructuredData
        categoryName="Comprar Backlinks"
        categoryUrl={canonicalUrl}
        backlinks={[]}
        description={metaDescription}
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          showCategoryGrid={true}
          seoContent={
            <div className="mt-12 space-y-8">
              {mainContent ? (
                <section 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: mainContent }}
                />
              ) : (
                <section className="prose prose-lg max-w-none">
                  <h2 className="text-2xl font-bold mb-4">Por que comprar backlinks de qualidade?</h2>
                  <p className="text-muted-foreground">
                    Os backlinks são um dos principais fatores de ranqueamento do Google. Quando sites de alta autoridade 
                    linkam para o seu, você ganha credibilidade e melhora sua posição nos resultados de busca. 
                    Nossa plataforma oferece backlinks em portais verificados com métricas reais.
                  </p>
                </section>
              )}
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
          <h1 className="text-4xl font-bold mb-6">{h1Title}</h1>
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
