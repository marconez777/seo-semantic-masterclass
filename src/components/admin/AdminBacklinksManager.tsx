import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { OFFICIAL_CATEGORIES } from "@/lib/categories";
import { ExternalLink } from "lucide-react";
import AdminBacklinksFilters from "./AdminBacklinksFilters";
import AdminBacklinksTableRow from "./AdminBacklinksTableRow";

export interface Backlink {
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

export type EditData = {
  domain: string;
  category: string;
  dr: string;
  da: string;
  traffic: string;
  price: string;
  status: string;
};

export interface AdminFilters {
  category: string;
  daRange: string;
  trafficRange: string;
  maxPrice: string;
  status: string;
}

function parseRange(value: string): [number, number] | null {
  if (!value || value === "todos") return null;
  if (value === "100000+") return [100000, Infinity];
  const parts = value.split("-");
  if (parts.length !== 2) return null;
  const min = Number(parts[0]);
  const max = Number(parts[1]);
  if (Number.isNaN(min) || Number.isNaN(max)) return null;
  return [min, max];
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditData | null>(null);
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState<AdminFilters>({
    category: "todos",
    daRange: "todos",
    trafficRange: "todos",
    maxPrice: "",
    status: "todos",
  });

  useEffect(() => {
    const t = window.setTimeout(() => { setDebouncedQ(q.trim()); setPage(0); }, 300);
    return () => window.clearTimeout(t);
  }, [q]);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [filters]);

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
        query = query.or(`domain.ilike.%${term}%,url.ilike.%${term}%`);
      }

      // Apply filters
      if (filters.category !== "todos") {
        query = query.eq("category", filters.category);
      }

      const daRange = parseRange(filters.daRange);
      if (daRange) {
        query = query.gte("da", daRange[0]);
        if (daRange[1] !== Infinity) query = query.lte("da", daRange[1]);
      }

      const trafficRange = parseRange(filters.trafficRange);
      if (trafficRange) {
        query = query.gte("traffic", trafficRange[0]);
        if (trafficRange[1] !== Infinity) query = query.lte("traffic", trafficRange[1]);
      }

      if (filters.maxPrice) {
        const price = Number(filters.maxPrice);
        if (!Number.isNaN(price)) query = query.lte("price", price);
      }

      if (filters.status !== "todos") {
        query = query.eq("status", filters.status);
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
  }, [debouncedQ, page, filters]);

  const totalPages = totalCount != null ? Math.ceil(totalCount / PAGE_SIZE) : 0;
  const countText = useMemo(() => {
    if (loading) return "Carregando…";
    if (totalCount != null && totalCount > rows.length) {
      return `Exibindo ${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + rows.length} de ${totalCount} resultado${totalCount === 1 ? "" : "s"}`;
    }
    return `${totalCount ?? rows.length} resultado${(totalCount ?? rows.length) === 1 ? "" : "s"}`;
  }, [rows.length, loading, totalCount, page]);

  function startEditing(b: Backlink) {
    setEditingId(b.id);
    setEditData({
      domain: b.domain ?? "",
      category: b.category ?? "",
      dr: String(b.dr ?? ""),
      da: String(b.da ?? ""),
      traffic: String(b.traffic ?? ""),
      price: String(b.price ?? ""),
      status: b.status ?? "ativo",
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditData(null);
  }

  async function handleSave() {
    if (!editingId || !editData) return;
    setSaving(true);
    try {
      const payload = {
        domain: editData.domain || null,
        category: editData.category || null,
        dr: editData.dr ? Number(editData.dr) : null,
        da: editData.da ? Number(editData.da) : null,
        traffic: editData.traffic ? Number(editData.traffic) : null,
        price: editData.price ? Number(editData.price) : null,
        status: editData.status || "ativo",
      };
      const { error } = await supabase.from("backlinks").update(payload).eq("id", editingId);
      if (error) throw error;
      setRows((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...payload } : r))
      );
      toast({ title: "Site atualizado com sucesso" });
      cancelEditing();
    } catch (err) {
      console.error("Erro ao salvar", err);
      toast({ title: "Erro ao salvar", description: String((err as any)?.message ?? err) });
    } finally {
      setSaving(false);
    }
  }

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
    <section className="space-y-4 mt-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-semibold">Gerenciar Sites</h2>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="destructive" onClick={handleDeleteAll} disabled={deletingAll || loading}>
            {deletingAll ? "Excluindo…" : "Excluir todos os sites"}
          </Button>
        </div>
      </div>

      <AdminBacklinksFilters
        q={q}
        setQ={setQ}
        filters={filters}
        setFilters={setFilters}
        onRefresh={() => fetchRows(debouncedQ, page)}
        loading={loading}
      />

      <div className="text-sm text-muted-foreground">{countText}</div>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/40">
            <tr className="text-left">
              <th className="p-3">Site</th>
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
                <td className="p-4" colSpan={7}>Carregando…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={7}>Nenhum site encontrado.</td>
              </tr>
            ) : (
              rows.map((b) => (
                <AdminBacklinksTableRow
                  key={b.id}
                  backlink={b}
                  isEditing={editingId === b.id}
                  editData={editingId === b.id ? editData : null}
                  setEditData={setEditData}
                  saving={saving}
                  deletingId={deletingId}
                  onStartEditing={startEditing}
                  onCancelEditing={cancelEditing}
                  onSave={handleSave}
                  onDelete={handleDeleteOne}
                />
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
