import HeroSection from "@/components/sections/HeroSection";
import CatalogPreviewSection from "@/components/sections/CatalogPreviewSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import GuaranteeSection from "@/components/sections/GuaranteeSection";
import CaseStudySection from "@/components/sections/CaseStudySection";
import PurchaseOptionsSection from "@/components/sections/PurchaseOptionsSection";
import NichesSection from "@/components/sections/NichesSection";
import AuditSection from "@/components/sections/AuditSection";
import FounderSection from "@/components/sections/FounderSection";
import FAQSection from "@/components/seo/FAQSection";
import LatestBlogPosts from "@/components/sections/LatestBlogPosts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
import StructuredData from "@/components/seo/StructuredData";

/**
 * Home — agência de backlinks.
 *
 * A palavra-chave desta página é **"comprar backlinks de qualidade"**. A vitrine
 * (`/comprar-backlinks`) fica com a intenção puramente transacional e
 * `/agencia-de-backlinks` com o termo institucional; aqui o trabalho é o
 * qualificador "de qualidade" — ou seja, provar *por que* estes links prestam:
 * catálogo aberto, processo com aprovação, garantia e casos reais.
 *
 * A consultoria de SEO saiu desta página: ela passa a viver em domínio próprio.
 */
const Index = () => {
  const organizationData = {
    name: "MK Art",
    url: "https://mkart.com.br",
    description:
      "Agência de backlinks especializada em guest posts editoriais em portais brasileiros, com catálogo aberto e garantia de 30 dias.",
    logo: "https://mkart.com.br/LOGOMK.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+55 11 98915-1997",
      contactType: "Customer Service",
      availableLanguage: "Portuguese",
    },
    sameAs: [
      "https://wa.me/5511989151997",
      "https://www.instagram.com/seosupremo777/",
      "https://www.youtube.com/@mkartseolinkbuilding614",
      "https://facebook.com/mkart.seo",
    ],
  };

  const websiteData = {
    name: "MK Art",
    url: "https://mkart.com.br",
    description:
      "Compre backlinks de qualidade em portais brasileiros. Você vê o DA, o tráfego e o preço antes de pagar.",
  };

  // As perguntas saem das objeções reais de quem compra link — preço, risco de
  // penalidade, métrica inflada, link que some — e não do dicionário de SEO.
  const faqData = [
    {
      question: "Comprar backlinks é seguro? Posso tomar penalidade do Google?",
      answer:
        "O risco não está em comprar, está em onde se compra. Nós publicamos artigos únicos, em contexto editorial, em portais brasileiros com tráfego real que você confere antes de pagar. Não trabalhamos com PBN, link farm nem rede privada de sites — que é justamente o que gera penalidade e desvalorização.",
    },
    {
      question: "Como eu sei que as métricas dos portais são reais?",
      answer:
        "Você não precisa acreditar na nossa palavra. O catálogo mostra o domínio, o DA e o tráfego mensal de cada portal antes da compra, então dá para conferir cada um no Ahrefs, no Semrush ou na ferramenta que você já usa. É por isso que o catálogo é aberto e não exige cadastro para ver preço.",
    },
    {
      question: "Qual é a garantia?",
      answer:
        "Em até 30 dias, se você não ficar satisfeito, devolvemos o dinheiro e removemos os links. Sem justificativa e sem crédito para usar depois. É devolução, não reposição.",
    },
    {
      question: "Vocês garantem em quanto tempo o link vai indexar?",
      answer:
        "Não, e essa é uma promessa que ninguém deveria fazer: quem decide quando indexar é o Google. O que está na nossa mão é produzir o conteúdo de um jeito que indexa mais rápido, e é por isso que a nossa garantia é de devolução do dinheiro, não de prazo.",
    },
    {
      question: "Em quanto tempo eu vejo resultado no ranqueamento?",
      answer:
        "Entre 2 e 6 meses, dependendo da concorrência do seu nicho, da autoridade dos portais escolhidos e de como está o SEO on-page do seu site. Backlink acelera e sustenta ganho de posição, mas não substitui conteúdo e estrutura — quem prometer primeira página em 30 dias está vendendo o que não controla.",
    },
    {
      question: "Quanto custa um backlink?",
      answer:
        "Depende da autoridade e do tráfego do portal. No nosso catálogo os valores vão de dezenas a milhares de reais por publicação, com o preço de cada portal visível na tela. Também existem pacotes de volume fechado e um plano mensal para quem quer cadência contínua.",
    },
    {
      question: "Os links são permanentes e dofollow?",
      answer:
        "Sim, todos os links são dofollow e publicados para permanecer. Se um link sair do ar dentro do período de garantia, resolvemos com você.",
    },
    {
      question: "Eu escolho o texto-âncora e o tema do artigo?",
      answer:
        "Sim. Você aprova a pauta e o texto-âncora antes da publicação. Se preferir, a MK define os dois seguindo uma distribuição de âncoras que não deixa o perfil de links artificial — nos pacotes isso é um serviço à parte.",
    },
    {
      question: "Preciso ter conta para comprar?",
      answer:
        "Para a compra avulsa no catálogo, sim, o checkout pede cadastro. Os pacotes de volume fechado não exigem conta: você preenche o pedido e a equipe envia as instruções de pagamento.",
    },
  ];

  return (
    <>
      <SEOHead
        title="Comprar Backlinks de Qualidade em Portais Brasileiros | MK Art"
        description="Compre backlinks de qualidade em portais brasileiros com DA e tráfego verificáveis. Você escolhe o site antes de pagar. Garantia de 30 dias com devolução."
        canonicalUrl="https://mkart.com.br/"
        keywords="comprar backlinks de qualidade, comprar backlinks, backlinks brasileiros, guest post, link building, DA"
      />
      <StructuredData type="organization" data={organizationData} />
      <StructuredData type="website" data={websiteData} />

      <Header />

      <main className="pt-20">
        <HeroSection />
        <CatalogPreviewSection />
        <HowItWorksSection />
        <GuaranteeSection />
        <CaseStudySection />
        <PurchaseOptionsSection />
        <NichesSection />
        <AuditSection />
        <FounderSection />
        <FAQSection
          title="Perguntas de quem está comprando backlinks"
          faqs={faqData}
          className="py-16 px-4 max-w-4xl mx-auto"
        />
        <LatestBlogPosts />
      </main>

      <Footer />
    </>
  );
};

export default Index;
