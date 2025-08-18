import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export type PixModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  orderId: string;
};

const PixModal = ({ open, onOpenChange, amount, orderId }: PixModalProps) => {
  const pixKey = "00020126360014br.gov.bcb.pix0114+5561999999999520400005303986540510.005802BR5913NOME DO LOJISTA6008BRASILIA62070503***6304E4A7";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixKey);
    toast({ title: "Chave PIX copiada!" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pague com PIX</DialogTitle>
          <DialogDescription>
            Use o QR Code ou a chave para pagar e concluir seu pedido.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">QR Code</p>
          </div>
          <p className="text-lg font-semibold">
            Total:{" "}
            {(amount / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-2">
          <div className="flex items-center space-x-2">
            <input
              readOnly
              value={pixKey}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button onClick={copyToClipboard}>Copiar</Button>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const phone = "5561999999999";
              const message = `Olá, fiz o pedido ${orderId} e gostaria de confirmar o pagamento.`;
              window.open(
                `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
                  message
                )}`,
                "_blank"
              );
            }}
          >
            Abrir WhatsApp
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Pedido ID: {orderId}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PixModal;
