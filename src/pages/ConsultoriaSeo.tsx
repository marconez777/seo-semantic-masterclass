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
          videoId="OWWQfH-V1Iw"
          keywords={[
            "1° como saber se eu tenho tdah",
            "1° como descobrir se eu tenho tdah", 
            "2° teste depressão bipolar",
            "2° teste rapido tdah"
          ]}
          backlinks={137}
          monthlyTraffic="115.803"
        />
        
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
          monthlyTraffic="12.500"
          reverse={true}
        />
        
        <CaseStudyCard
          title="A Loja Soluções em Embalagens foi de R$ 25 Mil a R$ 70 Mil em 3 Meses de SEO."
          clientName="Soluções em Embalagens"
          description="Em apenas 3 meses conseguimos aumentar o faturamento da loja online do cliente Paulo de R$ 25 Mil para R$ 70 Mil reais."
          videoId="iX7ShYZVxgo"
          keywords={[
            "1° comprar sacolas plásticas direto da fábrica",
            "1° fornecedor de sacolas",
            "2° comprar sacolas plásticas personalizadas",
            "2° comprar sacolas personalizadas plásticas"
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