import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type PurchaseModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: { id: string; name: string; price_cents: number };
};

const PurchaseModal = ({ open, onOpenChange, product }: PurchaseModalProps) => {
  const [urlDestino, setUrlDestino] = useState("");
  const [textoAncora, setTextoAncora] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const ensureAuth = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      navigate("/auth", { state: { from: location.pathname } });
      return false;
    }
    return true;
  };

  const handleAdd = async (goToCart: boolean) => {
    if (!urlDestino || !textoAncora) return;
    setSubmitting(true);
    const ok = await ensureAuth();
    if (!ok) {
      setSubmitting(false);
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price_cents: product.price_cents,
      quantity: 1,
      url_destino: urlDestino,
      texto_ancora: textoAncora,
    });
    setSubmitting(false);
    if (goToCart) {
      onOpenChange(false);
      navigate("/carrinho");
    } else {
      onOpenChange(false);
      toast({ title: "Adicionado ao Carrinho" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar ao carrinho</DialogTitle>
          <DialogDescription>
            Preencha os dados necessários para a publicação do backlink.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="url_destino">URL de destino</Label>
            <Input id="url_destino" value={urlDestino} onChange={(e) => setUrlDestino(e.target.value)} placeholder="https://seusite.com/pagina" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="texto_ancora">Texto âncora</Label>
            <Input id="texto_ancora" value={textoAncora} onChange={(e) => setTextoAncora(e.target.value)} placeholder="Palavra-chave / texto do link" />
          </div>
        </div>

        <DialogFooter>
          <div className="flex w-full justify-between gap-2">
            <Button variant="outline" disabled={submitting} onClick={() => handleAdd(false)}>
              Continuar comprando
            </Button>
            <Button disabled={submitting} onClick={() => handleAdd(true)}>
              Finalizar compra
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;
