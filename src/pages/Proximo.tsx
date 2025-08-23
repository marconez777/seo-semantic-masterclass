import { useEffect } from "react";

function setNoIndex() {
  let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "robots";
    document.head.appendChild(meta);
  }
  meta.content = "noindex,nofollow";
}

export default function Proximo() {
  useEffect(() => {
    const prev = (document.querySelector('meta[name="robots"]') as HTMLMetaElement | null)?.content;
    setNoIndex();
    document.title = "Próximo Passo (em implantação)";
    return () => {
      // opcional: restaurar robots anterior
      if (prev) {
        const meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
        if (meta) meta.content = prev;
      }
    };
  }, []);

  const params = new URLSearchParams(window.location.search);
  const sku = params.get("sku");
  const categoria = params.get("categoria");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-3 text-2xl font-semibold">Próximo Passo (em implantação)</h1>
      <p className="text-gray-700">
        Integração de checkout será instalada em breve. Nenhuma ação é necessária neste momento.
      </p>
      {(sku || categoria) && (
        <div className="mt-6 rounded-xl border p-4 text-sm">
          <div><strong>SKU:</strong> {sku ?? "—"}</div>
          <div><strong>Categoria:</strong> {categoria ?? "—"}</div>
        </div>
      )}
    </div>
  );
}
