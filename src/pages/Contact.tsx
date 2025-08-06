import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";

const Contact = () => {
  const pageData = {
    name: "Contato - MK Art Agência de SEO",
    url: "https://seo-semantic-masterclass.lovable.app/contato",
    description: "Entre em contato com nossa agência de SEO e backlinks. Consultoria especializada para melhorar seu ranking no Google."
  };

  return (
    <>
      <StructuredData type="website" data={pageData} />
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Entre em Contato
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Fale com nossa equipe de especialistas em SEO e backlinks
            </p>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Informações de Contato
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-foreground">Email</h3>
                    <p className="text-muted-foreground">contato@mkart.com.br</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Telefone</h3>
                    <p className="text-muted-foreground">(11) 99999-9999</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Horário de Atendimento</h3>
                    <p className="text-muted-foreground">Segunda à Sexta: 9h às 18h</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Formulário de Contato
                </h2>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Mensagem
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Enviar Mensagem
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Contact;