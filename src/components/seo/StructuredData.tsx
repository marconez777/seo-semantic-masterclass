import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'website' | 'article' | 'organization' | 'faq' | 'breadcrumb';
  data: any;
}

const StructuredData = ({ type, data }: StructuredDataProps) => {
  const schema = useMemo(() => {
    switch (type) {
      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": data.name,
          "url": data.url,
          "description": data.description
        };
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": data.name,
          "url": data.url,
          "logo": data.logo,
          "description": data.description,
          "sameAs": data.sameAs || []
        };
      case 'article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.headline,
          "description": data.description,
          "author": {
            "@type": "Person",
            "name": data.author
          },
          "datePublished": data.datePublished,
          "dateModified": data.dateModified,
          "image": data.image,
          "publisher": {
            "@type": "Organization",
            "name": data.publisher,
            "logo": data.publisherLogo
          }
        };
      case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.questions.map((q: any) => ({
            "@type": "Question",
            "name": q.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": q.answer
            }
          }))
        };
      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.items.map((item: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };
      default:
        return null;
    }
  }, [type, data]);

  if (!schema) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
