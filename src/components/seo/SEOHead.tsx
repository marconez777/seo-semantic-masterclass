import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

const SEOHead = ({ 
  title, 
  description, 
  canonicalUrl,
  keywords,
  ogImage = "/og-image.jpg",
  ogType = "website",
  noindex = false
}: SEOHeadProps) => {
  const siteName = "MK Art SEO";
  const defaultImage = "https://mkart.com.br/og-image.jpg";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImage || defaultImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultImage} />
      
      {/* Additional SEO */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#0066ff" />
    </Helmet>
  );
};

export default SEOHead;