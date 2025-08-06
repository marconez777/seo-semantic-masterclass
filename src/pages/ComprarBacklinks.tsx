import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";
import BacklinkListing from "@/components/marketplace/BacklinkListing";

const ComprarBacklinks = () => {
  const pageData = {
    name: "Comprar Backlinks de Qualidade - MK Art SEO",
    url: "https://seo-semantic-masterclass.lovable.app/comprar-backlinks",
    description: "Compre backlinks de sites com alta autoridade. Catálogo com centenas de opções organizadas por categoria e métricas transparentes."
  };

  return (
    <>
      <StructuredData type="website" data={pageData} />
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-6">
                Comprar Backlinks de Qualidade
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Explore nosso catálogo com centenas de sites de autoridade organizados por categoria. 
                Cada site possui métricas verificadas e tráfego orgânico comprovado para garantir resultados reais no seu SEO.
              </p>
            </div>
            
            <BacklinkListing />
            
            <div className="mt-16 prose prose-lg max-w-none text-muted-foreground">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Como funciona a compra de backlinks?
              </h2>
              <p>
                Nosso processo é simples e transparente. Você escolhe o site que melhor se adequa ao seu nicho, 
                fornece a URL de destino e o texto âncora desejado. Nossa equipe cuida de todo o processo de 
                publicação, garantindo que o link seja inserido de forma natural e contextualizada.
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-8">
                Processo de compra:
              </h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Escolha o site de sua preferência</li>
                <li>Informe a URL de destino e texto âncora</li>
                <li>Realize o pagamento via PIX ou cartão</li>
                <li>Aguarde a publicação (até 7 dias úteis)</li>
                <li>Receba o link final da publicação</li>
              </ol>
              
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-8">
                Critérios de qualidade:
              </h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Sites apenas com tráfego orgânico real</li>
                <li>Métricas DR/DA verificadas por ferramentas oficiais</li>
                <li>Conteúdo de qualidade e relevante ao nicho</li>
                <li>Histórico limpo (sem penalizações)</li>
                <li>Links contextualizados e naturais</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ComprarBacklinks;