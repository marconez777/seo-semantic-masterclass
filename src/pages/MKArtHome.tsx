
import { useEffect } from 'react';
import { Search, Target, TrendingUp, Users, Award, CheckCircle } from 'lucide-react';
import StructuredData from '@/components/seo/StructuredData';
import SEOHead from '@/components/seo/SEOHead';
import FAQSection from '@/components/seo/FAQSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SmartLink from '@/components/seo/SmartLink';
import MKArtHeader from '@/components/layout/MKArtHeader';

const MKArtHome = () => {
  const services = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "SEO Técnico Avançado",
      description: "Otimização completa da estrutura técnica do seu site para máxima performance nos buscadores."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Link Building Estratégico",
      description: "Construção de autoridade através de links de qualidade em sites relevantes do seu nicho."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Content Marketing",
      description: "Criação de conteúdo otimizado que atrai, engaja e converte seu público-alvo."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "SEO Local",
      description: "Estratégias específicas para negócios locais dominarem as buscas da sua região."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Consultoria SEO",
      description: "Assessoria especializada para implementar as melhores práticas de SEO na sua empresa."
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Auditoria Completa",
      description: "Análise detalhada do seu site com relatório completo e plano de ação personalizado."
    }
  ];

  const faqs = [
    {
      question: "O que diferencia a MK Art SEO de outras agências?",
      answer: "Nossa abordagem combina técnicas avançadas de SEO técnico com estratégias de conteúdo personalizadas. Temos expertise comprovada em diversos nichos e focamos em resultados sustentáveis a longo prazo."
    },
    {
      question: "Quanto tempo leva para ver resultados no SEO?",
      answer: "Os primeiros resultados começam a aparecer entre 3-6 meses, mas o SEO é um investimento a longo prazo. Resultados significativos e sustentáveis geralmente são observados entre 6-12 meses de trabalho consistente."
    },
    {
      question: "Vocês trabalham com que tipos de nichos?",
      answer: "Atendemos diversos segmentos: saúde, direito, e-commerce, tecnologia, educação, finanças e muitos outros. Nossa equipe tem experiência específica em cada nicho para garantir estratégias eficazes."
    },
    {
      question: "Como é feito o acompanhamento dos resultados?",
      answer: "Fornecemos relatórios mensais detalhados com métricas de tráfego, posicionamento de palavras-chave, conversões e ROI. Também fazemos reuniões periódicas para discutir estratégias e ajustes."
    }
  ];

  return (
    <>
      <SEOHead 
        title="MK Art SEO - Agência Especializada em Marketing Digital e SEO"
        description="Agência líder em SEO e marketing digital. Aumente sua visibilidade online, gere mais tráfego qualificado e melhore suas conversões com nossas estratégias avançadas."
        keywords="SEO, marketing digital, agência SEO, otimização sites, link building, consultoria SEO"
        url="https://mkart-seo.com"
        type="website"
      />
      
      <StructuredData type="organization" data={{
        name: "MK Art SEO",
        url: "https://mkart-seo.com",
        logo: "https://mkart-seo.com/logo.png",
        description: "Agência especializada em SEO e marketing digital",
        sameAs: [
          "https://www.linkedin.com/company/mkart-seo",
          "https://www.instagram.com/mkartseo",
          "https://www.facebook.com/mkartseo"
        ]
      }} />

      <div className="min-h-screen bg-background">
        <MKArtHeader />

        <main>
          {/* Hero Section */}
          <section className="py-20 px-4 text-center bg-gradient-to-b from-blue-50 to-background">
            <div className="container mx-auto max-w-4xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                MK Art SEO
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Transformamos sua presença digital com <strong>estratégias avançadas de SEO</strong> e <strong>marketing digital</strong> que geram resultados reais e mensuráveis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-4" asChild>
                  <SmartLink to="/contato">
                    Solicitar Proposta
                  </SmartLink>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4" asChild>
                  <SmartLink to="/servicos">
                    Nossos Serviços
                  </SmartLink>
                </Button>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section id="servicos" className="py-20 px-4">
            <div className="container mx-auto">
              <header className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">Nossos Serviços</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Soluções completas em SEO e marketing digital para impulsionar seu negócio
                </p>
              </header>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => (
                  <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                        {service.icon}
                      </div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {service.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="sobre" className="py-20 px-4 bg-muted/30">
            <div className="container mx-auto max-w-4xl">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl font-bold mb-6">Sobre a MK Art SEO</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Somos uma agência especializada em SEO e marketing digital com mais de 5 anos de experiência 
                    ajudando empresas de todos os tamanhos a alcançarem o topo dos resultados de busca.
                  </p>
                  <p className="text-lg text-muted-foreground mb-8">
                    Nossa missão é transformar a presença digital dos nossos clientes através de estratégias 
                    personalizadas, técnicas avançadas e um atendimento diferenciado.
                  </p>
                  <Button size="lg" asChild>
                    <SmartLink to="/sobre">
                      Conheça Nossa História
                    </SmartLink>
                  </Button>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-2xl font-bold mb-6 text-center">Por que escolher a MK Art?</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span>Resultados comprovados em diversos nichos</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span>Equipe certificada e sempre atualizada</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span>Relatórios transparentes e detalhados</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span>Suporte dedicado e personalizado</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 bg-blue-600 text-white">
            <div className="container mx-auto text-center max-w-3xl">
              <h2 className="text-4xl font-bold mb-6">Pronto para Dominar o Google?</h2>
              <p className="text-xl mb-8 opacity-90">
                Entre em contato conosco e descubra como podemos transformar 
                sua presença digital e gerar mais negócios para sua empresa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4" asChild>
                  <SmartLink to="/contato">
                    Falar com Especialista
                  </SmartLink>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-blue-600" asChild>
                  <SmartLink to="/portfolio">
                    Ver Cases de Sucesso
                  </SmartLink>
                </Button>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="py-20 px-4">
            <div className="container mx-auto max-w-4xl">
              <FAQSection 
                title="Perguntas Frequentes"
                faqs={faqs}
              />
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4">MK Art SEO</h3>
                <p className="text-gray-400 mb-4">
                  Agência especializada em SEO e marketing digital.
                </p>
                <div className="flex space-x-4">
                  {/* Social links would go here */}
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Serviços</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><SmartLink to="/servicos/guest-post" className="hover:text-white transition-colors">Guest Post</SmartLink></li>
                  <li><SmartLink to="/servicos/press-release" className="hover:text-white transition-colors">Press Release</SmartLink></li>
                  <li><SmartLink to="/link-building/do-follow" className="hover:text-white transition-colors">Link Building</SmartLink></li>
                  <li><SmartLink to="/nichos/marketing-digital" className="hover:text-white transition-colors">SEO para Marketing</SmartLink></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><SmartLink to="/sobre" className="hover:text-white transition-colors">Sobre Nós</SmartLink></li>
                  <li><SmartLink to="/portfolio" className="hover:text-white transition-colors">Portfólio</SmartLink></li>
                  <li><SmartLink to="/blog" className="hover:text-white transition-colors">Blog</SmartLink></li>
                  <li><SmartLink to="/contato" className="hover:text-white transition-colors">Contato</SmartLink></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Contato</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>contato@mkart-seo.com</li>
                  <li>(11) 99999-9999</li>
                  <li>São Paulo, SP</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>&copy; 2024 MK Art SEO. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default MKArtHome;
