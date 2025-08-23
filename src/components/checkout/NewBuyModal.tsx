import { useEffect } from "react";

type BuyItem = {
  sku?: string;
  titulo?: string;
  preco?: number | string;
  categoria?: string;
};

type Props = {
  open: boolean;
  item?: BuyItem;
  onClose: () => void;
  onContinue: (item?: BuyItem) => void;
};

export default function NewBuyModal({ open, item, onClose, onContinue }: Props) {
  useEffect(() => {
    // Bloqueia scroll quando o modal está aberto
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="mb-2 text-xl font-semibold">Confirmar interesse</h2>
        <p className="text-sm text-gray-600">
          {item?.titulo ?? "Publicação / Backlink"}{item?.categoria ? ` • ${item.categoria}` : ""}
        </p>
        {item?.preco !== undefined && (
          <p className="mt-1 text-base font-medium">Preço: {String(item.preco)}</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Fechar
          </button>
          <button
            onClick={() => onContinue(item)}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
