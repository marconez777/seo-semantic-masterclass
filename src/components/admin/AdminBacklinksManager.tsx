import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { OFFICIAL_CATEGORIES } from "@/lib/categories";

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

type EditData = {
  domain: string;
  url: string;
  category: string;
  dr: string;
  da: string;
  traffic: string;
  price: string;
  status: string;
};

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

  function startEditing(b: Backlink) {
    setEditingId(b.id);
    setEditData({
      domain: b.domain ?? "",
      url: b.url,
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
        url: editData.url,
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

  const isEditing = (id: string) => editingId === id;

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
              rows.map((b) =>
                isEditing(b.id) && editData ? (
                  <tr key={b.id} className="border-t align-top bg-muted/30">
                    <td className="p-2">
                      <Input
                        value={editData.domain}
                        onChange={(e) => setEditData({ ...editData, domain: e.target.value })}
                        placeholder="Domínio"
                        className="mb-1 h-8 text-xs"
                      />
                      <Input
                        value={editData.url}
                        onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                        placeholder="URL"
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="">— Sem categoria —</option>
                        {OFFICIAL_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          value={editData.dr}
                          onChange={(e) => setEditData({ ...editData, dr: e.target.value })}
                          placeholder="DR"
                          className="w-16 h-8 text-xs"
                        />
                        <Input
                          type="number"
                          value={editData.da}
                          onChange={(e) => setEditData({ ...editData, da: e.target.value })}
                          placeholder="DA"
                          className="w-16 h-8 text-xs"
                        />
                      </div>
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={editData.traffic}
                        onChange={(e) => setEditData({ ...editData, traffic: e.target.value })}
                        placeholder="Tráfego"
                        className="w-24 h-8 text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={editData.price}
                        onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                        placeholder="Preço (R$)"
                        className="w-24 h-8 text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <Button size="sm" onClick={handleSave} disabled={saving} className="h-8 text-xs">
                          {saving ? "Salvando…" : "Salvar"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing} disabled={saving} className="h-8 text-xs">
                          Cancelar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={b.id} className="border-t align-top">
                    <td className="p-3">
                      <div className="font-medium">{b.domain ?? "—"}</div>
                      <a
                        href={b.url}
                        className="text-xs text-primary hover:underline break-all"
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
                          variant="outline"
                          onClick={() => startEditing(b)}
                        >
                          Editar
                        </Button>
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
                )
              )
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
