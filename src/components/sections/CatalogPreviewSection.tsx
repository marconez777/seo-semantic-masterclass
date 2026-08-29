import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCatalogSample, useCatalogStats } from "@/hooks/useCatalogStats";
import { OFFICIAL_CATEGORIES } from "@/lib/categories";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const CatalogPreviewSection = () => {
  const { data: rows, isLoading } = useCatalogSample();
  const { data: stats } = useCatalogStats();

  return (
    <section className="py-16 md:py-20 bg-muted/40 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                O catálogo é aberto
              </h2>
              <p className="mt-3 text-muted-foreground max-w-2xl">
                Sem login e sem reunião para ver preço. Confira o DA e o tráfego
                de cada portal no Ahrefs antes de comprar — os dados abaixo são
                os mesmos que você usa para conferir.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link to="/comprar-backlinks">
                {stats?.total
                  ? `Ver os ${stats.total.toLocaleString("pt-BR")} portais`
                  : "Ver o catálogo completo"}
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm min-w-[600px]">
              <caption className="sr-only">
                Amostra de portais do catálogo da MK Art, com autoridade, tráfego e preço
              </caption>
              <thead className="bg-muted/60">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="p-4 font-medium">Portal</th>
                  <th scope="col" className="p-4 font-medium">DA</th>
                  <th scope="col" className="p-4 font-medium">Tráfego/mês</th>
                  <th scope="col" className="p-4 font-medium">Categoria</th>
                  <th scope="col" className="p-4 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="p-6 text-muted-foreground" colSpan={5}>
                      Carregando o catálogo...
                    </td>
                  </tr>
                ) : !rows?.length ? (
                  <tr>
                    <td className="p-6 text-muted-foreground" colSpan={5}>
                      Não foi possível carregar a amostra agora.{" "}
                      <Link to="/comprar-backlinks" className="text-primary underline">
                        Abra o catálogo completo
                      </Link>
                      .
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="p-4 font-medium text-foreground">{row.domain}</td>
                      <td className="p-4 tabular-nums text-foreground">{row.da ?? "-"}</td>
                      <td className="p-4 tabular-nums text-muted-foreground">
                        {row.traffic ? row.traffic.toLocaleString("pt-BR") : "-"}
                      </td>
                      <td className="p-4">
                        <span className="inline-block rounded-full border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                          {row.category}
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold tabular-nums text-foreground">
                        {brl(row.price)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Amostra de portais em faixas diferentes de autoridade, nicho e
            preço. O catálogo completo cobre {OFFICIAL_CATEGORIES.length}{" "}
            categorias.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CatalogPreviewSection;
