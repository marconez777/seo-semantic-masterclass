
import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'website' | 'article' | 'organization' | 'faq' | 'breadcrumb';
  data: any;
}

const StructuredData = ({ type, data }: StructuredDataProps) => {
  useEffect(() => {
    const generateSchema = () => {
      switch (type) {
        case 'website':
          return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": data.name,
            "url": data.url,
            "description": data.description,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${data.url}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
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
    };

    const schema = generateSchema();
    if (schema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [type, data]);

  return null;
};

export default StructuredData;
