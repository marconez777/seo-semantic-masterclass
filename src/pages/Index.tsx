
import { useEffect } from 'react';
import { Search, Code, Star, Shield, Users, Book } from 'lucide-react';
import StructuredData from '@/components/seo/StructuredData';
import OptimizedImage from '@/components/seo/OptimizedImage';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import FAQSection from '@/components/seo/FAQSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  useEffect(() => {
    // Configurar dados estruturados do site
    const websiteData = {
      name: "SEO Semantic Masterclass",
      url: "https://seo-semantic-masterclass.lovable.app",
      description: "Guia completo de SEO técnico e semântico para otimização em mecanismos de busca e IAs"
    };

    const organizationData = {
      name: "SEO Semantic Masterclass",
      url: "https://seo-semantic-masterclass.lovable.app",
      logo: "https://seo-semantic-masterclass.lovable.app/logo.png",
      description: "Especialistas em SEO técnico e otimização semântica",
      sameAs: []
    };

    return () => {
      // Cleanup se necessário
    };
  }, []);

  const breadcrumbItems = [
    { name: "Início", url: "/" }
  ];

  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "HTML Semântico Otimizado",
      description: "Estrutura HTML perfeita com tags semânticas, hierarquia de títulos e marcação adequada para máxima indexação."
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Meta Tags Estratégicas",
      description: "Meta tags otimizadas, Open Graph, Twitter Cards e dados estruturados para melhor visibilidade."
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Core Web Vitals",
      description: "Performance otimizada com foco em LCP, FID e CLS para rankings superiores no Google."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Schema Markup Avançado",
      description: "Dados estruturados completos para Rich Snippets e melhor compreensão por IAs."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "UX e Acessibilidade",
      description: "Design responsivo, acessível e otimizado para todos os dispositivos e usuários."
    },
    {
      icon: <Book className="w-8 h-8" />,
      title: "Conteúdo IA-Ready",
      description: "Estrutura de conteúdo otimizada para ser facilmente compreendida e citada por IAs."
    }
  ];

  const faqs = [
    {
      question: "O que é HTML semântico e por que é importante para SEO?",
      answer: "HTML semântico usa elementos que descrevem claramente seu significado tanto para desenvolvedores quanto para mecanismos de busca. Tags como <header>, <nav>, <main>, <article> e <footer> ajudam os motores de busca a entender a estrutura e hierarquia do conteúdo, melhorando significativamente o SEO."
    },
    {
      question: "Como otimizar Core Web Vitals para melhor ranking?",
      answer: "Para otimizar Core Web Vitals, foque em: 1) Largest Contentful Paint (LCP) - otimize imagens e carregamento de conteúdo; 2) First Input Delay (FID) - minimize JavaScript bloqueante; 3) Cumulative Layout Shift (CLS) - evite mudanças inesperadas de layout."
    },
    {
      question: "Qual a importância dos dados estruturados (Schema.org)?",
      answer: "Dados estruturados ajudam os motores de busca a entender o contexto do seu conteúdo, podendo resultar em Rich Snippets nos resultados de busca. Isso aumenta a visibilidade, CTR e ajuda IAs a compreender melhor seu conteúdo para citações."
    },
    {
      question: "Como preparar conteúdo para ser citado por IAs?",
      answer: "Para otimizar para IAs: estruture conteúdo em formato de perguntas e respostas, use listas e tabelas, implemente dados estruturados, mantenha linguagem clara e concisa, e organize informações de forma hierárquica e contextual."
    }
  ];

  return (
    <>
      <StructuredData type="website" data={{
        name: "SEO Semantic Masterclass",
        url: "https://seo-semantic-masterclass.lovable.app",
        description: "Guia completo de SEO técnico e semântico para otimização em mecanismos de busca e IAs"
      }} />
      
      <StructuredData type="organization" data={{
        name: "SEO Semantic Masterclass",
        url: "https://seo-semantic-masterclass.lovable.app",
        logo: "https://seo-semantic-masterclass.lovable.app/logo.png",
        description: "Especialistas em SEO técnico e otimização semântica"
      }} />

      <div className="min-h-screen bg-background">
        {/* Header Semântico */}
        <header className="bg-primary text-primary-foreground py-4 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-6 h-6" />
                <span className="text-xl font-bold">SEO Masterclass</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#recursos" className="hover:text-primary-foreground/80 transition-colors">Recursos</a>
                <a href="#guia" className="hover:text-primary-foreground/80 transition-colors">Guia</a>
                <a href="#faq" className="hover:text-primary-foreground/80 transition-colors">FAQ</a>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {/* Breadcrumbs */}
          <div className="container mx-auto px-4 py-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Hero Section */}
          <section className="py-20 px-4 text-center bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto max-w-4xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                SEO Semantic Masterclass
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Aprenda as melhores práticas de <strong>SEO técnico</strong> e <strong>HTML semântico</strong> para criar sites hiper otimizados que ranqueiam no Google e são facilmente compreendidos por IAs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-4">
                  Começar Agora
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  Ver Guia Completo
                </Button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="recursos" className="py-20 px-4">
            <div className="container mx-auto">
              <header className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">Recursos de Otimização Avançada</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Implementação completa das melhores práticas de SEO técnico e semântico
                </p>
              </header>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Guia Rápido Section */}
          <section id="guia" className="py-20 px-4 bg-muted/30">
            <div className="container mx-auto max-w-4xl">
              <header className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">Guia Rápido de Implementação</h2>
                <p className="text-xl text-muted-foreground">
                  Passos essenciais para otimizar seu site
                </p>
              </header>

              <article className="prose prose-lg max-w-none">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">1. Estrutura HTML Semântica</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Use tags semânticas apropriadas</li>
                      <li>• Hierarquia clara de títulos H1-H6</li>
                      <li>• Navegação com elementos nav</li>
                      <li>• Conteúdo principal em main</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">2. Meta Tags Otimizadas</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Title único e descritivo (50-60 chars)</li>
                      <li>• Meta description persuasiva (150-160 chars)</li>
                      <li>• Open Graph e Twitter Cards</li>
                      <li>• Canonical URLs e robots meta</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">3. Performance Web</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Otimização de Core Web Vitals</li>
                      <li>• Lazy loading de imagens</li>
                      <li>• Minificação de CSS/JS</li>
                      <li>• Compressão de imagens</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">4. Dados Estruturados</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Schema.org markup (JSON-LD)</li>
                      <li>• Rich Snippets configurados</li>
                      <li>• Breadcrumbs estruturados</li>
                      <li>• FAQ Pages otimizadas</li>
                    </ul>
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="py-20 px-4">
            <div className="container mx-auto max-w-4xl">
              <FAQSection 
                title="Perguntas Frequentes sobre SEO Técnico"
                faqs={faqs}
              />
            </div>
          </section>
        </main>

        {/* Footer Semântico */}
        <footer className="bg-primary text-primary-foreground py-12 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4">SEO Semantic Masterclass</h3>
                <p className="text-primary-foreground/80">
                  Seu guia completo para SEO técnico e otimização semântica avançada.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Recursos</h4>
                <ul className="space-y-2 text-primary-foreground/80">
                  <li><a href="#guia" className="hover:text-primary-foreground transition-colors">Guia de SEO</a></li>
                  <li><a href="#recursos" className="hover:text-primary-foreground transition-colors">Ferramentas</a></li>
                  <li><a href="#faq" className="hover:text-primary-foreground transition-colors">FAQ</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Contato</h4>
                <p className="text-primary-foreground/80">
                  Entre em contato para dúvidas sobre SEO técnico e implementação.
                </p>
              </div>
            </div>
            
            <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/60">
              <p>&copy; 2024 SEO Semantic Masterclass. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
