import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";
import SEOHead from "@/components/seo/SEOHead";

import DeliveryProcessSection from "@/components/sections/DeliveryProcessSection";
import CaseStudyCard from "@/components/sections/CaseStudyCard";
import LeadGenerationSection from "@/components/sections/LeadGenerationSection";

const ConsultoriaSaas = () => {
  console.log("ConsultoriaSaas component rendering");
  
  const pageData = {
    name: "Consultoria de SEO e GEO para SAAS - MK Art",
    url: "https://mkart.com.br/consultoria-seo-saas",
    description: "Com centenas de SAAS atendidos, temos um método validado focado em performance e vendas. Solicite uma análise grátis agora!"
  };

  return (
    <>
      <SEOHead
        title="Consultoria de SEO e GEO para SAAS | MK"
        description="Com centenas de SAAS atendidos, temos um método validado focado em performance e vendas. Solicite uma análise grátis agora!"
        canonicalUrl="https://mkart.com.br/consultoria-seo-saas"
        keywords="consultoria seo saas, seo para saas, marketing digital saas, posicionamento google saas"
      />
      <StructuredData type="website" data={pageData} />
      <Header />
      
      <main className="pt-20 min-h-screen bg-background">
        {/* Hero Section - Lead Generation */}
        <LeadGenerationSection
          customHeadline="Seu SAAS em Destaque nas IAs e em 1º no Google!"
        />
        
        {/* Delivery Process */}
        <DeliveryProcessSection />
        
        {/* Case Studies - Only Kronoos */}
        <CaseStudyCard
          title="O Sistema que foi para 1º Página em 3 meses do kronoos"
          clientName="kronoos"
          description="Em 3 meses, o Sistema Kronoos alcançou a 1ª página do Google com uma estratégia focada e assertiva."
          videoId="B35Poq_3xDM"
          keywords={[
            "1° ferramenta de background check",
            "1° compliance criminal",
            "1° compliance ambiental",
            "1° compliance bancário",
            "2° software compliance"
          ]}
          backlinks={88}
          monthlyTraffic="7.563"
        />
      </main>
      
      <Footer />
    </>
  );
};

export default ConsultoriaSaas;