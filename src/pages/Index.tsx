
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import StatsSection from "@/components/sections/StatsSection";
import CaseStudySection from "@/components/sections/CaseStudySection";
import FounderSection from "@/components/sections/FounderSection";
import FAQSection from "@/components/seo/FAQSection";
import NewsletterSection from "@/components/sections/NewsletterSection";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import StructuredData from "@/components/seo/StructuredData";

const Index = () => {
  const organizationData = {
    name: "MK Art - Agência de SEO",
    url: "https://seo-semantic-masterclass.lovable.app",
    description: "Agência especializada em SEO e Marketing Digital com mais de 9 anos de experiência e 1000+ clientes atendidos.",
    logo: "https://seo-semantic-masterclass.lovable.app/logo.png",
    sameAs: [
      "https://instagram.com/mkart",
      "https://youtube.com/mkart"
    ]
  };

  const websiteData = {
    name: "MK Art - Agência de SEO",
    url: "https://seo-semantic-masterclass.lovable.app",
    description: "Tráfego, Leads e Vendas Todos os Meses. Analisamos o seu site e concorrentes e mostramos a melhor estratégia."
  };

  const faqData = [
    {
      question: "O que são backlinks?",
      answer: "Backlinks, também conhecidos como 'links externos', são links de um website para outro. Se outro site faz referência ao seu site e coloca um link apontando para ele, você recebe um backlink. Esses links são uma parte vital da otimização para mecanismos de busca (SEO) porque servem como votos de confiança ou endossos para o seu site na visão dos motores de busca."
    },
    {
      question: "Como os backlinks podem me ajudar?",
      answer: "Os backlinks ajudam a aumentar a autoridade do seu site, melhoram o ranking nos mecanismos de busca, aumentam o tráfego orgânico e estabelecem credibilidade no seu nicho de mercado."
    },
    {
      question: "Quanto tempo leva para os backlinks começarem a mostrar resultados?",
      answer: "Os resultados dos backlinks podem começar a aparecer entre 2 a 6 meses, dependendo da qualidade dos links, autoridade dos sites e competitividade do nicho."
    },
    {
      question: "Os backlinks são permanentes?",
      answer: "A permanência dos backlinks depende do acordo feito e da política do site que hospeda o link. Trabalhamos com links de qualidade e duradouros para garantir resultados consistentes."
    }
  ];

  return (
    <>
      <SEOHead
        title="MK Art SEO - Comprar Backlinks de Qualidade | Agência Especializada"
        description="Compre backlinks de sites com alta autoridade. Agência especializada em link building com catálogo de centenas de sites verificados. Resultados garantidos."
        canonicalUrl="https://mkart.com.br/"
        keywords="comprar backlinks, agencia seo, link building, backlinks qualidade, autoridade, DR, DA, SEO"
      />
      <StructuredData type="organization" data={organizationData} />
      <StructuredData type="website" data={websiteData} />
      
      <Header />
      
      <main>
        <HeroSection />
        <ServicesSection />
        <StatsSection />
        <CaseStudySection />
        <FounderSection />
        <FAQSection 
          title="Perguntas Frequentes dos Nossos Clientes" 
          faqs={faqData}
          className="py-16 px-4 max-w-4xl mx-auto"
        />
        <NewsletterSection />
      </main>
      
      <Footer />
    </>
  );
};

export default Index;
