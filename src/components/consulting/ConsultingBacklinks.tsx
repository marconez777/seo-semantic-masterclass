import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Save, X, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { format, parse, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConsultingBacklinksProps {
  clientId: string;
  readOnly?: boolean;
}

interface Backlink {
  id: string;
  client_id: string;
  month: string;
  site_domain: string;
  dr: number | null;
  anchor_text: string | null;
  target_url: string | null;
  publication_url: string | null;
  status: string;
  position: number | null;
}

function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = -2; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    options.push({
      value: format(d, "yyyy-MM-dd"),
      label: format(d, "MMMM yyyy", { locale: ptBR }),
    });
  }
  return options;
}

const currentMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");

export function ConsultingBacklinks({ clientId, readOnly = false }: ConsultingBacklinksProps) {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Backlink>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [newRow, setNewRow] = useState({ site_domain: "", dr: "", anchor_text: "", target_url: "", publication_url: "", status: "pendente" });
  const monthOptions = getMonthOptions();

  const fetchBacklinks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("consulting_backlinks")
      .select("*")
      .eq("client_id", clientId)
      .eq("month", selectedMonth)
      .order("position", { ascending: true });
    setBacklinks((data as Backlink[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBacklinks(); }, [clientId, selectedMonth]);

  const handleAdd = async () => {
    if (!newRow.site_domain.trim()) { toast.error("Domínio é obrigatório"); return; }
    const { error } = await supabase.from("consulting_backlinks").insert({
      client_id: clientId,
      month: selectedMonth,
      site_domain: newRow.site_domain.trim(),
      dr: newRow.dr ? Number(newRow.dr) : 0,
      anchor_text: newRow.anchor_text || null,
      target_url: newRow.target_url || null,
      publication_url: newRow.publication_url || null,
      status: newRow.status,
      position: backlinks.length + 1,
    });
    if (error) { toast.error("Erro ao adicionar"); return; }
    toast.success("Backlink adicionado");
    setNewRow({ site_domain: "", dr: "", anchor_text: "", target_url: "", publication_url: "", status: "pendente" });
    setAddOpen(false);
    fetchBacklinks();
  };

  const handleSaveEdit = async (id: string) => {
    const { error } = await supabase.from("consulting_backlinks").update({
      site_domain: editData.site_domain,
      dr: editData.dr != null ? Number(editData.dr) : 0,
      anchor_text: editData.anchor_text || null,
      target_url: editData.target_url || null,
      publication_url: editData.publication_url || null,
      status: editData.status || "pendente",
    }).eq("id", id);
    if (error) { toast.error("Erro ao salvar"); return; }
    toast.success("Salvo");
    setEditId(null);
    fetchBacklinks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este backlink?")) return;
    await supabase.from("consulting_backlinks").delete().eq("id", id);
    toast.success("Excluído");
    fetchBacklinks();
  };

  const startEdit = (b: Backlink) => {
    setEditId(b.id);
    setEditData({ site_domain: b.site_domain, dr: b.dr, anchor_text: b.anchor_text, target_url: b.target_url, publication_url: b.publication_url, status: b.status });
  };

  const selectedLabel = monthOptions.find(o => o.value === selectedMonth)?.label ?? selectedMonth;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {monthOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="secondary">{backlinks.length} backlink{backlinks.length !== 1 ? "s" : ""}</Badge>
        </div>
        {!readOnly && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Backlink — {selectedLabel}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <Input placeholder="Domínio do site *" value={newRow.site_domain} onChange={e => setNewRow(p => ({ ...p, site_domain: e.target.value }))} />
                <Input placeholder="DR" type="number" value={newRow.dr} onChange={e => setNewRow(p => ({ ...p, dr: e.target.value }))} />
                <Input placeholder="Texto âncora" value={newRow.anchor_text} onChange={e => setNewRow(p => ({ ...p, anchor_text: e.target.value }))} />
                <Input placeholder="URL destino" value={newRow.target_url} onChange={e => setNewRow(p => ({ ...p, target_url: e.target.value }))} />
                <Input placeholder="Link de publicação" value={newRow.publication_url} onChange={e => setNewRow(p => ({ ...p, publication_url: e.target.value }))} />
                <Select value={newRow.status} onValueChange={v => setNewRow(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="publicado">Publicado</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAdd}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground py-8 text-center">Carregando...</p>
      ) : backlinks.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">Nenhum backlink neste mês.</p>
      ) : (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Site</TableHead>
                <TableHead className="w-16">DR</TableHead>
                <TableHead>Âncora</TableHead>
                <TableHead>URL Destino</TableHead>
                <TableHead>Publicação</TableHead>
                <TableHead className="w-28">Status</TableHead>
                {!readOnly && <TableHead className="w-20">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {backlinks.map((b, i) => (
                <TableRow key={b.id}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  {editId === b.id ? (
                    <>
                      <TableCell><Input value={editData.site_domain ?? ""} onChange={e => setEditData(p => ({ ...p, site_domain: e.target.value }))} /></TableCell>
                      <TableCell><Input type="number" className="w-16" value={editData.dr ?? ""} onChange={e => setEditData(p => ({ ...p, dr: Number(e.target.value) }))} /></TableCell>
                      <TableCell><Input value={editData.anchor_text ?? ""} onChange={e => setEditData(p => ({ ...p, anchor_text: e.target.value }))} /></TableCell>
                      <TableCell><Input value={editData.target_url ?? ""} onChange={e => setEditData(p => ({ ...p, target_url: e.target.value }))} /></TableCell>
                      <TableCell><Input value={editData.publication_url ?? ""} onChange={e => setEditData(p => ({ ...p, publication_url: e.target.value }))} /></TableCell>
                      <TableCell>
                        <Select value={editData.status ?? "pendente"} onValueChange={v => setEditData(p => ({ ...p, status: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="publicado">Publicado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(b.id)}><Save className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditId(null)}><X className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{b.site_domain}</TableCell>
                      <TableCell>{b.dr ?? "-"}</TableCell>
                      <TableCell>{b.anchor_text ?? "-"}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{b.target_url ?? "-"}</TableCell>
                      <TableCell>
                        {b.publication_url ? (
                          <a href={b.publication_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                            <LinkIcon className="h-3.5 w-3.5" /> Ver
                          </a>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={b.status === "publicado" ? "default" : "secondary"}>{b.status}</Badge>
                      </TableCell>
                      {!readOnly && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => startEdit(b)}><Pencil className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      )}
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
