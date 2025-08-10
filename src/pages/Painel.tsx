import { useEffect, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";

const Painel = () => {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setEmail(session?.user?.email ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user?.email ?? null));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <SEOHead
        title="Painel do Usuário | MK Art SEO"
        description="Acompanhe seus pedidos e dados de conta."
        canonicalUrl={`${window.location.origin}/painel`}
        keywords="painel, conta, pedidos"
      />
      <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Painel</h1>
        <p className="text-muted-foreground">Bem-vindo{email ? `, ${email}` : ""}.</p>
      </main>
    </>
  );
};

export default Painel;
