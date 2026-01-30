import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

function brl(v: number) {
  return (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CartModal() {
  const {
    items,
    mkWillChoose,
    setMkWillChoose,
    removeItem,
    updateItem,
    clearCart,
    isOpen,
    closeCart,
    total,
  } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateItems = (): boolean => {
    if (mkWillChoose) return true;

    const errors: Record<string, string> = {};
    items.forEach((item) => {
      if (!item.target_url.trim()) {
        errors[item.backlink_id] = "URL de destino é obrigatória";
      } else {
        try {
          new URL(item.target_url);
        } catch {
          errors[item.backlink_id] = "URL inválida";
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateItems()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a URL de destino para todos os sites ou marque 'Deixar a MK Art escolher'",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Faça login",
          description: "Você precisa estar logado para finalizar a compra",
        });
        navigate("/auth", { state: { from: "/comprar-backlinks" } });
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders_new")
        .insert({
          user_id: session.user.id,
          total: total,
          status: "aguardando_pagamento",
          payment_method: "pix_whatsapp",
          payment_status: "aguardando",
        })
        .select("id")
        .single();

      if (orderError || !order) {
        throw new Error(orderError?.message || "Erro ao criar pedido");
      }

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        backlink_id: item.backlink_id,
        price: item.price,
        anchor_text: mkWillChoose ? null : item.anchor_text || null,
        target_url: mkWillChoose ? null : item.target_url,
        item_status: "pendente",
        mk_will_choose: mkWillChoose,
      }));

      const { error: itemsError } = await supabase
        .from("order_items_new")
        .insert(orderItems);

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      // Success
      clearCart();
      closeCart();
      
      toast({
        title: "Pedido criado com sucesso!",
        description: "Entraremos em contato via WhatsApp para enviar o PIX.",
      });

      navigate("/continuar-comprando", { 
        state: { orderId: order.id, orderTotal: total } 
      });

    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Erro ao finalizar pedido",
        description: error.message || "Tente novamente mais tarde",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={closeCart}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Carrinho vazio
            </DialogTitle>
            <DialogDescription>
              Adicione backlinks ao seu carrinho para continuar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={closeCart}>Voltar à loja</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={closeCart}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrinho de Compras ({items.length} {items.length === 1 ? "item" : "itens"})
          </DialogTitle>
          <DialogDescription>
            Preencha o texto âncora e URL de destino para cada backlink.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr className="text-left">
                  <th className="p-3 font-semibold">Site</th>
                  <th className="p-3 font-semibold">DR</th>
                  <th className="p-3 font-semibold hidden sm:table-cell">Texto Âncora</th>
                  <th className="p-3 font-semibold hidden sm:table-cell">URL de Destino</th>
                  <th className="p-3 font-semibold text-right">Preço</th>
                  <th className="p-3 font-semibold w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.backlink_id} className="border-t">
                    <td className="p-3">
                      <div className="font-medium">{item.domain}</div>
                      <div className="text-xs text-muted-foreground">{item.category}</div>
                      {/* Mobile inputs */}
                      <div className="sm:hidden mt-2 space-y-2">
                        <Input
                          placeholder="Texto âncora"
                          value={item.anchor_text}
                          onChange={(e) => updateItem(item.backlink_id, { anchor_text: e.target.value })}
                          disabled={mkWillChoose}
                          className="h-8 text-xs"
                        />
                        <Input
                          placeholder="URL de destino *"
                          value={item.target_url}
                          onChange={(e) => {
                            updateItem(item.backlink_id, { target_url: e.target.value });
                            if (validationErrors[item.backlink_id]) {
                              setValidationErrors((prev) => {
                                const copy = { ...prev };
                                delete copy[item.backlink_id];
                                return copy;
                              });
                            }
                          }}
                          disabled={mkWillChoose}
                          className={`h-8 text-xs ${validationErrors[item.backlink_id] ? "border-destructive" : ""}`}
                        />
                        {validationErrors[item.backlink_id] && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors[item.backlink_id]}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-primary font-medium">{item.dr ?? "-"}</td>
                    <td className="p-3 hidden sm:table-cell">
                      <Input
                        placeholder="palavra-chave"
                        value={item.anchor_text}
                        onChange={(e) => updateItem(item.backlink_id, { anchor_text: e.target.value })}
                        disabled={mkWillChoose}
                        className="h-8"
                      />
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <div>
                        <Input
                          placeholder="https://seusite.com *"
                          value={item.target_url}
                          onChange={(e) => {
                            updateItem(item.backlink_id, { target_url: e.target.value });
                            if (validationErrors[item.backlink_id]) {
                              setValidationErrors((prev) => {
                                const copy = { ...prev };
                                delete copy[item.backlink_id];
                                return copy;
                              });
                            }
                          }}
                          disabled={mkWillChoose}
                          className={`h-8 ${validationErrors[item.backlink_id] ? "border-destructive" : ""}`}
                        />
                        {validationErrors[item.backlink_id] && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors[item.backlink_id]}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium">{brl(item.price)}</td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.backlink_id)}
                        aria-label="Remover item"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-start space-x-3 p-4 bg-muted/40 rounded-lg">
            <Checkbox
              id="mk-will-choose"
              checked={mkWillChoose}
              onCheckedChange={(checked) => setMkWillChoose(checked === true)}
            />
            <div className="space-y-1">
              <Label
                htmlFor="mk-will-choose"
                className="text-sm font-medium cursor-pointer"
              >
                Deixar a MK Art escolher o texto âncora e URL
              </Label>
              <p className="text-xs text-muted-foreground">
                Nossa equipe irá escolher as melhores opções de âncora e URL para otimizar seus backlinks.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-primary">{brl(total)}</span>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeCart}>
              Continuar comprando
            </Button>
            <Button 
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? "Processando..." : "Finalizar Pedido (PIX)"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
