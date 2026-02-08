import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, Check } from "lucide-react";
import { useState } from "react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  total: number;
}

const PIX_CNPJ = "54.128.027/0001-93";
const PIX_NAME = "Keila de Oliveira Castellini";
const WHATSAPP_NUMBER = "5511989151997";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PaymentModal({ open, onOpenChange, orderId, total }: PaymentModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CNPJ);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de tirar dúvidas sobre o pagamento do meu pedido #${orderId.slice(0, 8).toUpperCase()}.\n\nValor: ${brl(total)}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleSendReceipt = () => {
    const message = encodeURIComponent(
      `Olá! Segue o comprovante de pagamento do pedido #${orderId.slice(0, 8).toUpperCase()}.\n\nValor: ${brl(total)}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Realizar Pagamento</DialogTitle>
          <DialogDescription className="text-center">
            Pedido #{orderId.slice(0, 8).toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Total */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
            <p className="text-3xl font-bold text-primary">{brl(total)}</p>
          </div>

          {/* PIX Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              Segue abaixo o PIX para a realização do pagamento:
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between bg-background rounded-md p-3 border">
                <div>
                  <p className="text-xs text-muted-foreground">CNPJ</p>
                  <p className="font-mono font-semibold">{PIX_CNPJ}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyPix}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="bg-background rounded-md p-3 border">
                <p className="text-xs text-muted-foreground">Favorecido</p>
                <p className="font-semibold">{PIX_NAME}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button onClick={handleSendReceipt} className="w-full" size="lg">
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar Comprovante via WhatsApp
            </Button>

            <Button
              onClick={handleWhatsApp}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Dúvidas? Fale Conosco
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Após o pagamento, envie o comprovante via WhatsApp para confirmarmos seu pedido.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
