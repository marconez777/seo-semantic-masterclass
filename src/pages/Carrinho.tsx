
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { createCheckout } from "@/services/payment";
import { useState } from "react";
const Carrinho = () => {
  const { items, totalCents, itemsCount, clearCart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const totalBRL = (totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const finalize = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/auth";
        return;
      }
      const customer = {
        name: (session.user.user_metadata as any)?.name,
        phone: (session.user.user_metadata as any)?.phone,
        cpf: (session.user.user_metadata as any)?.cpf,
        email: session.user.email,
      };

      const orders = items.map((it) => ({
        id: it.id,
        name: it.name,
        quantity: it.quantity,
        priceCents: it.price_cents,
        description: `Ancora: ${it.texto_ancora} | URL: ${it.url_destino}`,
        anchorText: it.texto_ancora,
        targetUrl: it.url_destino,
      }));

      const res = await createCheckout(orders as any, customer as any);
      if (res.url && res.url !== '#') {
        window.location.href = res.url;
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error('Falha ao finalizar compra', e);
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Carrinho de Compras | MK Art SEO"
        description="Revise seus backlinks antes de finalizar a compra."
        canonicalUrl={`${window.location.origin}/carrinho`}
        keywords="carrinho, backlinks, compra"
      />
      <Header />
      <main className="pt-24 min-h-screen px-4 py-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Carrinho</h1>

        {items.length === 0 ? (
          <p className="text-muted-foreground">Seu carrinho está vazio.</p>
        ) : (
          <section className="space-y-4">
            {items.map((it) => (
              <div key={`${it.id}-${it.texto_ancora}-${it.url_destino}`} className="border rounded-md p-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">{it.name}</h2>
                  <p className="text-sm text-muted-foreground">Âncora: {it.texto_ancora}</p>
                  <p className="text-sm text-muted-foreground">URL destino: {it.url_destino}</p>
                  <p className="text-sm">Qtd: {it.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{(it.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => removeFromCart(it.id)}>Remover</Button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">Itens: {itemsCount}</p>
              <p className="text-xl font-semibold">Total: {totalBRL}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={clearCart} disabled={loading}>Limpar carrinho</Button>
              <Button onClick={finalize} disabled={loading || items.length === 0} aria-busy={loading}>
                {loading ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                    </svg>
                    Redirecionando...
                  </>
                ) : (
                  'Finalizar compra'
                )}
              </Button>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Carrinho;
