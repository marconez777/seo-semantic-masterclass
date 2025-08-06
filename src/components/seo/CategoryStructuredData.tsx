import { Helmet } from "react-helmet-async";

interface Backlink {
  id: string;
  site_url: string;
  valor: number;
  categoria: string;
  dr: number;
  da: number;
  trafego_mensal: number;
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
      "itemListElement": backlinks.slice(0, 20).map((backlink, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": `Backlink - ${new URL(backlink.site_url).hostname.replace('www.', '')}`,
          "description": `Site da categoria ${backlink.categoria} com DR ${backlink.dr}, DA ${backlink.da} e ${backlink.trafego_mensal.toLocaleString()} visitas mensais`,
          "category": backlink.categoria,
          "url": backlink.site_url,
          "offers": {
            "@type": "Offer",
            "price": backlink.valor.toFixed(2),
            "priceCurrency": "BRL",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "MK Art SEO"
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": Math.min(5, Math.max(1, (backlink.dr + backlink.da) / 20)),
            "reviewCount": Math.floor(backlink.trafego_mensal / 1000),
            "bestRating": 5,
            "worstRating": 1
          },
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Domain Rating (DR)",
              "value": backlink.dr
            },
            {
              "@type": "PropertyValue", 
              "name": "Domain Authority (DA)",
              "value": backlink.da
            },
            {
              "@type": "PropertyValue",
              "name": "Tráfego Mensal",
              "value": backlink.trafego_mensal
            }
          ]
        }
      }))
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