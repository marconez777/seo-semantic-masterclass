import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import CategoryStructuredData from "@/components/seo/CategoryStructuredData";
import BacklinkMarketplace from "@/components/marketplace/BacklinkMarketplace";
import FAQSection from "@/components/seo/FAQSection";
import { usePageSEOContent } from "@/hooks/usePageSEOContent";

interface CategoryPageProps {
  // Database identifiers
  pageSlug: string;
  categoryName: string;
  categorySlug: string;
  
  // Fallback values (used if no DB content exists)
  fallback: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    canonicalUrl: string;
    h1Title: string;
    h2Subtitle?: string;
    introText?: string;
    seoContent: React.ReactNode;
  };
}

export default function DynamicCategoryPage({ 
  pageSlug, 
  categoryName, 
  categorySlug, 
  fallback 
}: CategoryPageProps) {
  const { data: seoData } = usePageSEOContent(pageSlug);

  // Use dynamic data or fallback
  const metaTitle = seoData?.meta_title || fallback.metaTitle;
  const metaDescription = seoData?.meta_description || fallback.metaDescription;
  const metaKeywords = seoData?.meta_keywords || fallback.metaKeywords;
  const canonicalUrl = seoData?.canonical_url || fallback.canonicalUrl;
  const h1Title = seoData?.h1_title || fallback.h1Title;
  const h2Subtitle = seoData?.h2_subtitle || fallback.h2Subtitle;
  const introText = seoData?.intro_text || fallback.introText;
  const mainContent = seoData?.main_content;
  const faqs = seoData?.faqs || [];

  const breadcrumbItems = [
    { name: "Início", url: "https://mkart.com.br/" },
    { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
    { name: `Backlinks de ${categoryName}`, url: `https://mkart.com.br/${pageSlug}` },
  ];

  return (
    <>
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        canonicalUrl={canonicalUrl}
        keywords={metaKeywords}
      />
      <StructuredData
        type="breadcrumb"
        data={{ items: breadcrumbItems }}
      />
      <CategoryStructuredData
        categoryName={`Backlinks de ${categoryName}`}
        categoryUrl={canonicalUrl}
        backlinks={[]}
        description={metaDescription}
      />
      <Header />
      <main className="container mx-auto px-4 py-28">
        <BacklinkMarketplace
          category={categoryName}
          showCategoryGrid={true}
          currentCategorySlug={categorySlug}
          seoContent={
            <div className="mt-12 space-y-8">
              {/* Dynamic content from database */}
              {mainContent ? (
                <section 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: mainContent }}
                />
              ) : (
                /* Fallback static content */
                fallback.seoContent
              )}

              {/* FAQs from database */}
              {faqs.length > 0 && (
                <FAQSection 
                  faqs={faqs}
                  title={`Perguntas Frequentes sobre Backlinks de ${categoryName}`}
                />
              )}
            </div>
          }
        >
          <Breadcrumbs
            className="mb-3"
            items={[
              { name: 'Início', url: '/' },
              { name: 'Comprar Backlinks', url: '/comprar-backlinks' },
              { name: categoryName, url: `/${pageSlug}` },
            ]}
          />
          <h1 className="text-4xl font-bold mb-6">{h1Title}</h1>
          {h2Subtitle && (
            <h2 className="text-2xl font-semibold mb-6">{h2Subtitle}</h2>
          )}
          {introText && (
            <p className="text-muted-foreground mb-8">{introText}</p>
          )}
        </BacklinkMarketplace>
      </main>
      <Footer />
    </>
  );
}
