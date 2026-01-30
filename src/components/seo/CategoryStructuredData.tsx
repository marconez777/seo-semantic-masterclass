import { Helmet } from "react-helmet-async";

interface Backlink {
  id: string;
  site_url: string;
  site_name?: string;
  price_cents: number;
  category: string;
  dr: number | null;
  da: number | null;
  traffic: number | null;
}

interface CategoryStructuredDataProps {
  categoryName: string;
  categoryUrl: string;
  backlinks: Backlink[];
  description?: string;
}

const CategoryStructuredData = ({ 
  categoryName, 
  categoryUrl, 
  backlinks,
  description 
}: CategoryStructuredDataProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": categoryName,
    "description": description || `Compre backlinks de qualidade na categoria ${categoryName}`,
    "url": categoryUrl,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": backlinks.length,
      "itemListElement": backlinks.slice(0, 20).map((backlink, index) => {
        const dr = backlink.dr ?? 0;
        const da = backlink.da ?? 0;
        const traffic = backlink.traffic ?? 0;
        const priceInReais = backlink.price_cents / 100;
        
        // Safely extract hostname from URL
        let siteName = backlink.site_name;
        if (!siteName && backlink.site_url) {
          try {
            const urlStr = backlink.site_url.startsWith('http') 
              ? backlink.site_url 
              : `https://${backlink.site_url}`;
            siteName = new URL(urlStr).hostname.replace('www.', '');
          } catch {
            siteName = backlink.site_url?.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || 'Site';
          }
        }
        
        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": `Backlink - ${siteName}`,
            "description": `Site da categoria ${backlink.category} com DR ${dr}, DA ${da} e ${traffic.toLocaleString('pt-BR')} visitas mensais`,
            "category": backlink.category,
            "url": backlink.site_url,
            "offers": {
              "@type": "Offer",
              "price": priceInReais.toFixed(2),
              "priceCurrency": "BRL",
              "availability": "https://schema.org/InStock",
              "seller": {
                "@type": "Organization",
                "name": "MK Art SEO"
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": Math.min(5, Math.max(1, (dr + da) / 20)).toFixed(1),
              "reviewCount": Math.max(1, Math.floor(traffic / 1000)),
              "bestRating": 5,
              "worstRating": 1
            },
            "additionalProperty": [
              {
                "@type": "PropertyValue",
                "name": "Domain Rating (DR)",
                "value": dr
              },
              {
                "@type": "PropertyValue", 
                "name": "Domain Authority (DA)",
                "value": da
              },
              {
                "@type": "PropertyValue",
                "name": "Tráfego Mensal",
                "value": traffic
              }
            ]
          }
        };
      })
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Início",
          "item": "https://mkart.com.br/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Comprar Backlinks",
          "item": "https://mkart.com.br/comprar-backlinks"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": categoryName,
          "item": categoryUrl
        }
      ]
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default CategoryStructuredData;
