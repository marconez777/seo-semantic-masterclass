import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const pageData = {
    name: "Contato - MK Art Agência de SEO",
    url: "https://seo-semantic-masterclass.lovable.app/contato",
    description: "Entre em contato com nossa agência de SEO e backlinks. Consultoria especializada para melhorar seu ranking no Google."
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "Mensagem enviada!",
        description: "Recebemos sua mensagem e retornaremos em breve."
      });

      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente ou entre em contato diretamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StructuredData type="website" data={pageData} />
      <Header />
      
      <main className="pt-20 min-h-screen bg-background">
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
                    <h3 className="font-medium text-foreground">Endereço</h3>
                    <p className="text-muted-foreground">Rua Caminho do Pilar, 401 - Santo André – SP</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Telefone</h3>
                    <p className="text-muted-foreground">+55 11 9 8915 1997</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Email</h3>
                    <p className="text-muted-foreground">contato@mkart.com.br</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Formulário de Contato
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
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