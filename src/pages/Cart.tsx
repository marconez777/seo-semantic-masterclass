import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const CREATE_URL = import.meta.env.VITE_FN_CREATE_ORDER;
const GET_URL = import.meta.env.VITE_FN_GET_ORDER;

const Cart = () => {
  const { items, totalCents, itemsCount, clearCart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [pixKey, setPixKey] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [orderStatus, setOrderStatus] = useState<string>("pending");
  const { toast } = useToast();
  const totalBRL = (totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  useEffect(() => {
    if (!orderId || !showPixModal) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${GET_URL}?order_id=${orderId}`);
        if (res.ok) {
          const { status } = await res.json();
          setOrderStatus(status);
          if (status === 'paid') {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("Error polling order status:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, showPixModal]);

  const finalize = async () => {
    if (import.meta.env.VITE_CHECKOUT_ENGINE !== "new") {
      // old flow
      return;
    }

    try {
      setLoading(true);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast({ title: "Erro de autenticação", description: "Por favor, faça login novamente." });
        window.location.href = "/auth";
        return;
      }

      const cartItems = items.map(it => ({
        id: it.id,
        name: it.name,
        quantity: it.quantity,
        price_cents: it.price_cents,
        texto_ancora: it.texto_ancora,
        url_destino: it.url_destino,
      }));

      const response = await fetch(CREATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          items: cartItems,
          total_cents: totalCents
        })
      });

      if (!response.ok) {
        throw new Error("Falha ao criar o pedido.");
      }

      const result = await response.json();

      setOrderId(result.order_id);
      setPixKey(result.pix_key);
      setExpiresAt(new Date(result.expires_at).toLocaleString("pt-BR"));
      setOrderStatus('pending');
      setShowPixModal(true);
      toast({ title: "Pedido criado com sucesso!" });

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
                {loading ? "Processando..." : 'Finalizar compra'}
              </Button>
            </div>
          </section>
        )}

        <Dialog open={showPixModal} onOpenChange={(open) => {
          setShowPixModal(open);
          if (!open) clearCart();
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Finalize o pagamento por PIX</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div>
                  <span className="font-semibold">Chave PIX:</span>
                  <div className="font-mono text-sm">{pixKey}</div>
                </div>
                <div>
                  <span className="font-semibold">Expira em:</span>
                  <div className="text-sm">{expiresAt}</div>
                </div>
                <div>
                  <span className="font-semibold">Total:</span>
                  <div className="text-lg font-semibold">{totalBRL}</div>
                </div>
                <div>
                  <span className="font-semibold">Status:</span>
                  <div className="text-sm">{orderStatus}</div>
                </div>
                {orderId && (
                  <div>
                    <span className="font-semibold">Pedido:</span>
                    <div className="text-sm font-mono">{orderId}</div>
                  </div>
                )}
              </div>
              <Button onClick={() => navigator.clipboard.writeText(pixKey)} variant="outline">
                Copiar Chave PIX
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </>
  );
};

export default Cart;
