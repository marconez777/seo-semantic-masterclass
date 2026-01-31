import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSection = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "E-mail obrigatório",
        description: "Por favor, digite seu e-mail."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save lead to database
      const { error: dbError } = await supabase
        .from("contact_submissions")
        .insert({
          name: "Lead Newsletter",
          email: email,
          message: "Solicitou lista de 30 sites para Guest Post DR 20-90"
        });

      if (dbError) {
        console.error("Error saving lead:", dbError);
      }

      // Send email with list
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-guest-post-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar email');
      }

      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para acessar a lista de sites."
      });

      setEmail("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o e-mail. Tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Receba agora uma lista com...
          </h2>
          
          <div className="relative">
            <div className="border-4 border-green-400 rounded-full px-8 py-4 inline-block transform rotate-1">
              <span className="text-2xl md:text-3xl font-bold text-purple-400">
                30 Sites para GUEST POST DR 20 a 90 GRÁTIS!
              </span>
            </div>
          </div>
          
          <p className="text-xl text-gray-300">no seu e-mail</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <Input 
              type="email" 
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 flex-1"
              required
            />
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Receber Grátis"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
