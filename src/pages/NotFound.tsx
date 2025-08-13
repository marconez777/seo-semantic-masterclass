import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  return (
    <>
      <SEOHead 
        title="Página não encontrada - 404 | MK Backlinks"
        description="A página que você está procurando não foi encontrada. Volte para a página inicial ou navegue por nossos serviços de backlinks."
        canonicalUrl="/404"
      />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Página não encontrada
              </h2>
              <p className="text-muted-foreground mb-8">
                A página que você está procurando não existe ou foi movida.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link to="/">
                  Voltar para a página inicial
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link to="/comprar-backlinks">
                  Ver nossos backlinks
                </Link>
              </Button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default NotFound;