import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: {
    id: string;
    name: string;
    price_cents: number;
  };
}

const ContactModal = ({ open, onOpenChange, product }: ContactModalProps) => {
  const [urlDestino, setUrlDestino] = useState("");
  const [textoAncora, setTextoAncora] = useState("");

  const handleContact = () => {
    const message = `Olá! Tenho interesse no backlink "${product?.name}" no valor de R$ ${((product?.price_cents || 0) / 100).toFixed(2).replace('.', ',')}.

Detalhes:
- URL de destino: ${urlDestino}
- Texto âncora: ${textoAncora}

Gostaria de mais informações sobre como proceder com a compra.`;

    const whatsappUrl = `https://wa.me/5511991795436?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Orçamento</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para solicitar um orçamento para este backlink.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="url-destino">URL de destino *</Label>
            <Input
              id="url-destino"
              type="url"
              placeholder="https://seusite.com"
              value={urlDestino}
              onChange={(e) => setUrlDestino(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="texto-ancora">Texto âncora</Label>
            <Input
              id="texto-ancora"
              placeholder="palavra-chave ou texto do link"
              value={textoAncora}
              onChange={(e) => setTextoAncora(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleContact}
            disabled={!urlDestino}
            className="gap-2"
          >
            <ExternalLink size={16} />
            Contatar WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;