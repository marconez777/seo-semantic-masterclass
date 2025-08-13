import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";

import DeliveryProcessSection from "@/components/sections/DeliveryProcessSection";
import CaseStudyCard from "@/components/sections/CaseStudyCard";
import LeadGenerationSection from "@/components/sections/LeadGenerationSection";

const ConsultoriaSeo = () => {
  console.log("ConsultoriaSeo component rendering");
  
  const pageData = {
    name: "Consultoria de SEO e Backlinks - MK Art",
    url: "https://seo-semantic-masterclass.lovable.app/consultoria-de-seo",
    description: "Consultoria especializada em SEO e estratégias de backlinks. Análise completa do seu site e estratégia personalizada."
  };

  return (
    <>
      <StructuredData type="website" data={pageData} />
      <Header />
      
      <main className="pt-20 min-h-screen bg-background">
        {/* Hero Section - Lead Generation */}
        <LeadGenerationSection />
        
        {/* Delivery Process */}
        <DeliveryProcessSection />
        
        {/* Case Studies */}
        <CaseStudyCard
          title="Mais de 100 Mil Visitas no Site do Dr. Gabriel"
          clientName="Dr. Gabriel"
          description="O cliente atingiu 100k de visitas mensais e sua recepcionista chegou até a reclamar de não estar dando conta de tantos atendimentos."
          videoId="dQw4w9WgXcQ" // Replace with actual video ID
          keywords={[
            "Psiquiatra tdah",
            "Teste diagnóstico tdah", 
            "Como descobrir tdah teste",
            "Como saber se eu tenho tdah teste"
          ]}
          backlinks={137}
          monthlyTraffic="115.803"
        />
        
        <CaseStudyCard
          title="O Sistema que foi para 1º Página em 3 meses do kronoos"
          clientName="kronoos"
          description="Em 3 meses, o Sistema Kronoos alcançou a 1ª página do Google com uma estratégia focada e assertiva."
          videoId="dQw4w9WgXcQ" // Replace with actual video ID
          keywords={[
            "listas restritivas",
            "compliance contratual",
            "puxar ficha da pessoa pelo cpf",
            "listas restritivas internacionais"
          ]}
          backlinks={88}
          monthlyTraffic="7.563"
          reverse={true}
        />
        
        <CaseStudyCard
          title="O e commerce Soluções em Embalagens foi de R$ 25 Mil p/ R$ 70 Mil em apenas 3 meses."
          clientName="Soluções em Embalagens"
          description="Em apenas 3 meses conseguimos aumentar o faturamento da loja online do cliente Paulo de R$ 25 Mil para R$ 70 Mil reais."
          videoId="dQw4w9WgXcQ" // Replace with actual video ID
          keywords={[
            "envelope de segurança",
            "envelope de segurança preço",
            "comprar envelope de segurança",
            "envelope de segurança personalizado"
          ]}
          backlinks={35}
          monthlyTraffic="50.230"
        />
      </main>
      
      <Footer />
    </>
  );
};

export default ConsultoriaSeo;