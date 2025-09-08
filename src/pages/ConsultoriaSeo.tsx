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
        
        {/* Video Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video w-full max-w-3xl mx-auto mb-8">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/I-urTlQK3bc?si=qnuTwmbnfTch3M0x" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                  className="rounded-lg shadow-lg"
                ></iframe>
              </div>
              <a 
                href="#hero" 
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Receber Auditoria Grátis
              </a>
            </div>
          </div>
        </section>
        
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