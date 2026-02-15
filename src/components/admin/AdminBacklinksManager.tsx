import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Backlink {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  domain: string | null;
  url: string;
  category: string | null;
  price: number | null;
  dr: number | null;
  da: number | null;
  traffic: number | null;
  status: string | null;
  tipo: string | null;
  observacoes: string | null;
}

export default function AdminBacklinksManager() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [rows, setRows] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 200;
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => { setDebouncedQ(q.trim()); setPage(0); }, 300);
    return () => window.clearTimeout(t);
  }, [q]);

  async function fetchRows(term: string, pageNum: number) {
    setLoading(true);
    try {
      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("backlinks")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (term) {
        query = supabase
          .from("backlinks")
          .select("*", { count: "exact" })
          .or(`domain.ilike.%${term}%,url.ilike.%${term}%`)
          .order("created_at", { ascending: false })
          .range(from, to);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      setRows((data as Backlink[]) ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      console.error("Erro ao buscar sites", err);
      toast({ title: "Erro ao buscar sites", description: String((err as any)?.message ?? err) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows(debouncedQ, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, page]);

  const totalPages = totalCount != null ? Math.ceil(totalCount / PAGE_SIZE) : 0;
  const countText = useMemo(() => {
    if (loading) return "Carregando…";
    if (totalCount != null && totalCount > rows.length) {
      return `Exibindo ${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + rows.length} de ${totalCount} resultado${totalCount === 1 ? "" : "s"}`;
    }
    return `${totalCount ?? rows.length} resultado${(totalCount ?? rows.length) === 1 ? "" : "s"}`;
  }, [rows.length, loading, totalCount, page]);

  async function handleDeleteOne(id: string) {
    const ok = window.confirm("Tem certeza que deseja excluir este site? Esta ação não pode ser desfeita.");
    if (!ok) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("backlinks").delete().eq("id", id);
      if (error) throw error;
      setRows((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Site excluído com sucesso" });
    } catch (err) {
      console.error("Erro ao excluir site", err);
      toast({ title: "Erro ao excluir site", description: String((err as any)?.message ?? err) });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteAll() {
    if (rows.length === 0) {
      toast({ title: "Não há sites para excluir" });
      return;
    }
    const ok = window.confirm(
      "Tem certeza que deseja excluir TODOS os sites? Esta ação é permanente e removerá todos os registros."
    );
    if (!ok) return;
    setDeletingAll(true);
    try {
      // Deleta todas as linhas: usando not('id', 'is', null) como filtro universal
      const { error } = await supabase.from("backlinks").delete().not("id", "is", null);
      if (error) throw error;
      setRows([]);
      setQ("");
      setDebouncedQ("");
      toast({ title: "Todos os sites foram excluídos" });
    } catch (err) {
      console.error("Erro ao excluir todos os sites", err);
      toast({ title: "Erro ao excluir todos os sites", description: String((err as any)?.message ?? err) });
    } finally {
      setDeletingAll(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-semibold">Gerenciar Sites</h2>
        <div className="flex items-center gap-2 ml-auto">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar site (domínio ou URL)…"
            className="w-72"
          />
          <Button variant="secondary" onClick={() => fetchRows(debouncedQ, page)} disabled={loading}>
            Buscar
          </Button>
          <Button variant="destructive" onClick={handleDeleteAll} disabled={deletingAll || loading}>
            {deletingAll ? "Excluindo…" : "Excluir todos os sites"}
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">{countText}</div>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/40">
            <tr className="text-left">
              <th className="p-3">Domínio</th>
              <th className="p-3">URL</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">DR/DA</th>
              <th className="p-3">Tráfego</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={8}>
                  Carregando…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={8}>
                  Nenhum site encontrado.
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr key={b.id} className="border-t align-top">
                  <td className="p-3 font-medium">{b.domain ?? "—"}</td>
                  <td className="p-3">
                    <a
                      href={b.url}
                      className="text-primary hover:underline break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {b.url}
                    </a>
                  </td>
                  <td className="p-3">{b.category ?? "—"}</td>
                  <td className="p-3">{[b.dr ?? "—", b.da ?? "—"].join("/")}</td>
                  <td className="p-3">{b.traffic?.toLocaleString("pt-BR") ?? "—"}</td>
                  <td className="p-3">
                    {b.price != null
                      ? b.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      : "—"}
                  </td>
                  <td className="p-3">
                    {b.status === "ativo" ? (
                      <Badge className="bg-green-600 text-white hover:bg-green-600">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">{b.status ?? "Inativo"}</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteOne(b.id)}
                        disabled={deletingId === b.id}
                      >
                        {deletingId === b.id ? "Excluindo…" : "Excluir"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
          >
            ← Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
          >
            Próxima →
          </Button>
        </div>
      )}
    </section>
  );
}
