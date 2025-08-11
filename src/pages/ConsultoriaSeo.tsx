import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";

const ConsultoriaSeo = () => {
  const pageData = {
    name: "Consultoria de SEO e Backlinks - MK Art",
    url: "https://seo-semantic-masterclass.lovable.app/consultoria-de-seo-backlinks",
    description: "Consultoria especializada em SEO e estratégias de backlinks. Análise completa do seu site e estratégia personalizada."
  };

  return (
    <>
      <StructuredData type="website" data={pageData} />
      <Header />
      
      <main className="pt-20 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-6">
                Consultoria de SEO e Backlinks
              </h1>
              <p className="text-lg text-muted-foreground">
                Análise completa do seu site e estratégia personalizada para acelerar seu crescimento orgânico
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  O que está incluso:
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-medium text-foreground">Auditoria Técnica Completa</h3>
                      <p className="text-muted-foreground">Análise detalhada dos fatores técnicos que impactam seu SEO</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-medium text-foreground">Análise de Backlinks</h3>
                      <p className="text-muted-foreground">Avaliação do perfil atual de links e identificação de oportunidades</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-medium text-foreground">Estratégia Personalizada</h3>
                      <p className="text-muted-foreground">Plano de ação específico para seu nicho e objetivos</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-medium text-foreground">Acompanhamento Mensal</h3>
                      <p className="text-muted-foreground">Relatórios detalhados e ajustes na estratégia</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-card p-8 rounded-lg border">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Solicite sua consultoria
                </h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-foreground mb-2">
                      URL do seu site
                    </label>
                    <input
                      type="url"
                      id="website"
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="https://seusite.com.br"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Seu email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Solicitar Consultoria
                  </Button>
                </form>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Por que investir em uma consultoria de SEO?
              </h2>
              <p>
                Uma estratégia bem estruturada de SEO e backlinks pode transformar completamente a presença 
                digital do seu negócio. Nossa consultoria vai além da análise superficial, oferecendo insights 
                profundos e um plano de ação prático para alcançar os primeiros resultados no Google.
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-8">
                Resultados que você pode esperar:
              </h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Aumento significativo no tráfego orgânico</li>
                <li>Melhoria no ranking de palavras-chave estratégicas</li>
                <li>Fortalecimento da autoridade do seu domínio</li>
                <li>ROI positivo em médio prazo</li>
                <li>Vantagem competitiva sustentável</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ConsultoriaSeo;