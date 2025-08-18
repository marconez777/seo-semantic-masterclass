
import SEOHead from "@/components/seo/SEOHead";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import PixPaymentModal from "@/components/PixPaymentModal";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { items, totalCents, itemsCount, clearCart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [pixOpen, setPixOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const totalBRL = (totalCents / 100);

  async function finalize() {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: order, error } = await supabase
        .from("pedidos")
        .insert({ user_id: session.user.id, total_cents: totalCents, status: "pending" })
        .select()
        .single();
      if (error) {
        toast({ title: "Erro ao criar pedido", variant: "destructive" });
        return;
      }

      await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          backlink_id: i.id,
          quantity: 1,
          price_cents: i.price_cents,
          anchor_text: i.texto_ancora,
          target_url: i.url_destino,
        }))
      );

      setLastOrderId(order.id);
      setPixOpen(true);
    } catch (e) {
      console.error("Falha ao finalizar compra", e);
      toast({ title: "Ocorreu um erro inesperado.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEOHead
        title="Carrinho de Compras | MK Art SEO"
        description="Revise seus backlinks antes de finalizar a compra."
        canonicalUrl={`${window.location.origin}/cart`}
        keywords="carrinho, backlinks, compra"
      />
      <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Carrinho</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Button asChild>
              <a
                href="/comprar-backlinks"
                aria-label="Voltar para Comprar Backlinks"
              >
                Voltar para Comprar Backlinks
              </a>
            </Button>
          </div>
        ) : (
          <section className="space-y-4">
            {items.map((it) => (
              <div
                key={`${it.id}-${it.texto_ancora}-${it.url_destino}`}
                className="border rounded-md p-4 flex items-start justify-between gap-4 bg-card"
              >
                <div>
                  <h2 className="font-medium">{it.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Âncora:</span>{" "}
                    {it.texto_ancora}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">URL destino:</span>{" "}
                    {it.url_destino}
                  </p>
                  <p className="text-sm">Qtd: {it.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {(it.price_cents / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => removeFromCart(it.id)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Itens: {itemsCount}
              </p>
              <p className="text-xl font-semibold">Total: {totalBRL.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearCart}
                disabled={loading}
              >
                Limpar carrinho
              </Button>
              <Button
                onClick={finalize}
                disabled={loading || items.length === 0}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      ></path>
                    </svg>
                    Processando...
                  </>
                ) : (
                  "Finalizar compra"
                )}
              </Button>
            </div>
          </section>
        )}
      </main>
      <PixPaymentModal
        open={pixOpen}
        onClose={() => {
          setPixOpen(false);
          navigate("/painel?paid=1");
        }}
        amountBRL={totalCents / 100}
        orderId={lastOrderId}
      />
    </>
  );
};

export default Cart;
