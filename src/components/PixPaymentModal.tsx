import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  amountBRL: number; // valor em reais (ex.: 5000.00)
  orderId?: string;
};

export default function PixPaymentModal({ open, onClose, amountBRL, orderId }: Props) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!open) return null;

  const text =
`Chave Pix:
CNPJ: 54.128.027/0001-93
keila de Oliveira Castellini`;

  const msg = encodeURIComponent(
    `Olá! Fiz um pagamento via PIX para o pedido ${orderId ?? "—"}.\nValor: R$ ${amountBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.\nPoderiam confirmar, por favor?`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Pagamento via PIX</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full px-2 py-1 hover:bg-gray-100">✕</button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Valor: <strong>R$ {amountBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
          </p>

          <pre className="whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm">
{text}
          </pre>

          <p className="text-sm text-gray-700">
            Aqui está a chave pix para você realizar o seu pagamento. Assim que o pagamento for identificado, inicia o prazo de até 7 dias para a publicação dos backlinks. Você pode conferir o status e o link da publicação no seu painel. Dúvidas: WhatsApp 11&nbsp;99179-5436.
          </p>

          <div className="flex gap-2">
            <button
              className="rounded-xl border px-4 py-2 hover:bg-gray-50"
              onClick={() => navigator.clipboard.writeText(text)}
            >
              Copiar chave PIX
            </button>
            <a
              className="rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              href={`https://wa.me/5511991795436?text=${msg}`}
              target="_blank" rel="noreferrer"
            >
              Falar no WhatsApp
            </a>
            <button
              className="ml-auto rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              onClick={onClose}
            >
              Já paguei / Ir ao painel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
