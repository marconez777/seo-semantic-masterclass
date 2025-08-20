
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { createCheckout } from "@/services/payment";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { items, totalCents, itemsCount, clearCart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [pixKey, setPixKey] = useState<string>("");
  const { toast } = useToast();
  const totalBRL = (totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const finalize = async () => {
    try {
      setLoading(true);
      
      // Check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast({ title: "Erro de autenticação", description: "Erro ao verificar sessão" });
        setLoading(false);
        return;
      }
      
      if (!session) {
        console.log('No session, redirecting to auth');
        window.location.href = "/auth";
        return;
      }

      console.log('Session found, user:', session.user.email);

      // Prepare customer data
      const customer = {
        name: (session.user.user_metadata as any)?.name,
        phone: (session.user.user_metadata as any)?.phone,
        cpf: (session.user.user_metadata as any)?.cpf,
        email: session.user.email,
      };

      // Prepare orders
      const orders = items.map((it) => ({
        id: it.id,
        name: it.name,
        quantity: it.quantity,
        priceCents: it.price_cents,
        description: `Ancora: ${it.texto_ancora} | URL: ${it.url_destino}`,
        anchorText: it.texto_ancora,
        targetUrl: it.url_destino,
      }));

      console.log('Finalizing order with:', { orders, customer });

      // Create checkout
      const result = await createCheckout(orders as any, customer as any);
      
      console.log('Checkout result:', result);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.mode === 'manual' && result.orderId && result.pix_key) {
        setOrderId(result.orderId);
        setPixKey(result.pix_key);
        setShowPixModal(true);
        toast({ title: "Pedido criado com sucesso!" });
      } else {
        throw new Error('Resposta inválida do checkout');
      }
    } catch (error) {
      console.error('Falha ao finalizar compra:', error);
      toast({ 
        title: "Erro ao finalizar compra", 
        description: error instanceof Error ? error.message : "Erro desconhecido" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Carrinho de Compras | MK Art SEO"
        description="Revise seus backlinks antes de finalizar a compra."
        canonicalUrl={`${window.location.origin}/cart`}
        keywords="carrinho, backlinks, compra"
      />
      <Header />
      <main className="pt-24 min-h-screen px-4 py-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Carrinho</h1>

        {items.length === 0 ? (
          <div className="text-muted-foreground">
            <p>Seu carrinho está vazio.</p>
            <Button variant="link" asChild className="mt-2 p-0">
              <a href="/comprar-backlinks" aria-label="Ir para a loja de backlinks">loja de backlinks</a>
            </Button>
          </div>
        ) : (
          <section className="space-y-4">
            {items.map((it) => (
              <div key={`${it.id}-${it.texto_ancora}-${it.url_destino}`} className="border rounded-md p-4 flex items-start justify-between gap-4 bg-card">
                <div>
                  <h2 className="font-medium">{it.name}</h2>
                  <p className="text-sm text-muted-foreground"><span className="font-semibold">Âncora:</span> {it.texto_ancora}</p>
                  <p className="text-sm text-muted-foreground"><span className="font-semibold">URL destino:</span> {it.url_destino}</p>
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
                    Processando...
                  </>
                ) : (
                  'Finalizar compra'
                )}
              </Button>
            </div>
          </section>
        )}

        {/* Modal PIX */}
        <Dialog open={showPixModal} onOpenChange={(open) => {
          setShowPixModal(open);
          if (!open) {
            clearCart();
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Finalize o pagamento por PIX</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Por favor, realize o PIX do valor total do seu pedido na chave abaixo.
                Após identificarmos o pagamento, inicia a contagem de 7 dias para publicação de todos os backlinks.
              </p>
              
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div>
                  <span className="font-semibold">Chave PIX:</span>
                  <div className="font-mono text-sm">{pixKey}</div>
                </div>
                <div>
                  <span className="font-semibold">Titular:</span>
                  <div className="text-sm">Keila de Oliveira Castellini</div>
                </div>
                <div>
                  <span className="font-semibold">Total:</span>
                  <div className="text-lg font-semibold">{totalBRL}</div>
                </div>
                {orderId && (
                  <div>
                    <span className="font-semibold">Pedido:</span>
                    <div className="text-sm font-mono">{orderId}</div>
                  </div>
                )}
              </div>

              <div className="text-sm">
                <span className="font-semibold">Contato WhatsApp (dúvidas):</span>
                <div>11 99179-5436</div>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(pixKey);
                    toast({ title: "Chave PIX copiada para a área de transferência" });
                  }}
                  variant="outline"
                >
                  Copiar Chave PIX
                </Button>
                
                <Button 
                  onClick={() => {
                    window.open("https://wa.me/5511991795436", "_blank");
                  }}
                  variant="outline"
                >
                  Ir ao WhatsApp
                </Button>
                
                <Button 
                  onClick={() => {
                    setShowPixModal(false);
                    window.location.href = "/painel";
                  }}
                >
                  Ver meus pedidos
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </>
  );
};

export default Cart;
