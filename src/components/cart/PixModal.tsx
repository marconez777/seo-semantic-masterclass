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
  totalCents: number;
};

const PixModal = ({ open, onOpenChange, totalCents }: PixModalProps) => {
  const pixKey = "54.128.027/0001-93";
  const pixName = "keila de Oliveira Castellini";
  const pixMessage =
    "Aqui está a chave pix para você realizar o seu pagamento. Assim que o pagamento for identificado, inicia o prazo de até 7 dias para a publicação dos backlinks. Você pode conferir o status e o link da publicação no seu painel. Dúvidas: WhatsApp 11 99179-5436.";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixKey);
    toast({ title: "Chave PIX (CNPJ) copiada!" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pague via Pix</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-lg font-semibold text-center">
            Total:{" "}
            {(totalCents / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <div className="text-center">
            <p className="font-semibold">Chave Pix (CNPJ):</p>
            <p>{pixKey}</p>
            <p className="font-semibold mt-2">Nome:</p>
            <p>{pixName}</p>
          </div>
          <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
            {pixMessage}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2">
          <Button onClick={copyToClipboard}>Copiar chave</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PixModal;
