import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";


const AgenciaBacklinks = () => {
  const pageData = {
    name: "Agência de Backlinks - MK Art SEO",
    url: "https://seo-semantic-masterclass.lovable.app/agencia-de-backlinks",
    description: "Agência especializada em backlinks de qualidade. Compre links de autoridade para melhorar o ranking do seu site no Google."
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
                Agência de Backlinks de Qualidade
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Encontre os melhores sites para comprar backlinks de autoridade. Nossa seleção inclui sites com alto DR/DA, 
                tráfego qualificado e relevância temática para potencializar o SEO do seu projeto.
              </p>
            </div>
            
            
            
            <div className="mt-16 prose prose-lg max-w-none text-muted-foreground">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Por que escolher nossa agência de backlinks?
              </h2>
              <p>
                Com mais de 9 anos de experiência em SEO, nossa agência oferece backlinks de sites reais, 
                com tráfego orgânico comprovado e métricas transparentes. Todos os nossos parceiros passam 
                por uma rigorosa curadoria para garantir qualidade e segurança para seu projeto.
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-8">
                Nossos diferenciais:
              </h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Sites com métricas reais (DR/DA verificados)</li>
                <li>Tráfego orgânico comprovado</li>
                <li>Diversidade de nichos e categorias</li>
                <li>Links permanentes e seguros</li>
                <li>Processo transparente e profissional</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default AgenciaBacklinks;