import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";

const PaymentSuccess = () => {
  const pageData = {
    name: "Pagamento Realizado - MK Art SEO",
    url: "https://seo-semantic-masterclass.lovable.app/payment-success",
    description: "Pagamento realizado com sucesso. Seu backlink será publicado em breve."
  };

  return (
    <>
      <StructuredData type="website" data={pageData} />
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-50 p-8 rounded-lg border border-green-200 mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-green-800 mb-4">
                Pagamento Aprovado!
              </h1>
              
              <p className="text-green-700 text-lg mb-6">
                Seu pagamento foi processado com sucesso. O backlink será publicado em até 3 dias úteis.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-green-100">
                <h2 className="font-semibold text-green-800 mb-2">Próximos passos:</h2>
                <ul className="text-left text-green-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Aguarde a publicação do backlink (até 3 dias úteis)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Acompanhe o status no seu painel de compras
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Receba o link final da publicação por email
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <a
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Ver Meus Pedidos
              </a>
              
              <br />
              
              <a
                href="/comprar-backlinks"
                className="inline-flex items-center px-6 py-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              >
                Comprar Mais Backlinks
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default PaymentSuccess;