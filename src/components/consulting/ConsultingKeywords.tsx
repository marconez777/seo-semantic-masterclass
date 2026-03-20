import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload, X, Check, Pencil, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Keyword {
  id: string;
  keyword: string;
  volume: number;
  cpc: number;
  position: number;
  current_position: number | null;
  previous_position: number | null;
  best_position: number | null;
  last_checked_at: string | null;
}

interface Snapshot {
  keyword_id: string;
  month: string;
  position: number | null;
}

interface Props {
  clientId: string;
  readOnly: boolean;
}

function formatMonthLabel(monthStr: string): string {
  const d = new Date(monthStr + "T12:00:00");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
}

function getPositionColor(position: number | null, prevPosition: number | null): string {
  if (position === null) return "text-muted-foreground";
  if (prevPosition === null) return "text-foreground font-medium";
  if (position < prevPosition) return "text-green-600 font-semibold";
  if (position > prevPosition) return "text-orange-500 font-semibold";
  return "text-foreground font-medium";
}

export function ConsultingKeywords({ clientId, readOnly }: Props) {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newVolume, setNewVolume] = useState("");
  const [newCpc, setNewCpc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ keyword: string; volume: string; cpc: string }>({ keyword: "", volume: "", cpc: "" });
  const [bulkText, setBulkText] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchKeywords = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("consulting_keywords")
      .select("*")
      .eq("client_id", clientId)
      .order("position", { ascending: true });
    setKeywords((data as any[]) || []);
    setLoading(false);
  };

  const fetchSnapshots = async () => {
    const { data: kws } = await supabase
      .from("consulting_keywords")
      .select("id")
      .eq("client_id", clientId);
    if (!kws || kws.length === 0) { setSnapshots([]); return; }
    const ids = kws.map(k => k.id);
    const { data } = await supabase
      .from("consulting_keyword_snapshots")
      .select("keyword_id, month, position")
      .in("keyword_id", ids)
      .order("month", { ascending: true });
    setSnapshots((data as any[]) || []);
  };

  useEffect(() => { fetchKeywords(); fetchSnapshots(); }, [clientId]);

  // Derive unique sorted months
  const months = [...new Set(snapshots.map(s => s.month))].sort();
  const snapshotMap: Record<string, Record<string, number | null>> = {};
  for (const s of snapshots) {
    if (!snapshotMap[s.keyword_id]) snapshotMap[s.keyword_id] = {};
    snapshotMap[s.keyword_id][s.month] = s.position;
  }

  const lastCheckedAt = keywords.find(k => k.last_checked_at)?.last_checked_at;

  const handleCheckPositions = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("serpbot-proxy", {
        body: { action: "check_consulting_client", client_id: clientId },
      });
      if (error) throw error;
      toast({ title: "Posições atualizadas", description: `${data?.results?.length || 0} palavras verificadas.` });
      fetchKeywords();
      fetchSnapshots();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message || "Falha ao verificar posições" });
    } finally {
      setChecking(false);
    }
  };

  const handleAdd = async () => {
    if (!newKeyword.trim()) return;
    const { error } = await supabase.from("consulting_keywords").insert({
      client_id: clientId,
      keyword: newKeyword.trim(),
      volume: parseInt(newVolume) || 0,
      cpc: parseFloat(newCpc) || 0,
      position: keywords.length + 1,
    });
    if (error) {
      toast({ title: "Erro", description: error.message });
    } else {
      setNewKeyword(""); setNewVolume(""); setNewCpc("");
      fetchKeywords();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("consulting_keywords").delete().eq("id", id);
    fetchKeywords();
    fetchSnapshots();
  };

  const startEdit = (kw: Keyword) => {
    setEditingId(kw.id);
    setEditValues({ keyword: kw.keyword, volume: String(kw.volume), cpc: String(kw.cpc) });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ keyword: "", volume: "", cpc: "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("consulting_keywords").update({
      keyword: editValues.keyword.trim(),
      volume: parseInt(editValues.volume) || 0,
      cpc: parseFloat(editValues.cpc) || 0,
    }).eq("id", editingId);
    if (error) {
      toast({ title: "Erro", description: error.message });
    } else {
      cancelEdit();
      fetchKeywords();
    }
  };

  const handleBulkImport = async () => {
    const lines = bulkText.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    setBulkLoading(true);

    const rows = lines.map((line, idx) => {
      const parts = line.split("\t").length > 1 ? line.split("\t") : line.split(";");
      return {
        client_id: clientId,
        keyword: (parts[0] || "").trim(),
        volume: parseInt((parts[1] || "0").replace(/\./g, "").trim()) || 0,
        cpc: parseFloat((parts[2] || "0").replace(",", ".").replace("R$", "").trim()) || 0,
        position: keywords.length + idx + 1,
      };
    }).filter(r => r.keyword);

    const { error } = await supabase.from("consulting_keywords").insert(rows);
    setBulkLoading(false);
    if (error) {
      toast({ title: "Erro na importação", description: error.message });
    } else {
      toast({ title: "Importado!", description: `${rows.length} palavras-chave adicionadas.` });
      setBulkText("");
      setBulkOpen(false);
      fetchKeywords();
    }
  };

  const fixedColCount = readOnly ? 4 : 5; // #, keyword, volume, cpc, [actions]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <div>
          <CardTitle className="text-lg">Palavras-Chave ({keywords.length})</CardTitle>
          {lastCheckedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Última verificação: {new Date(lastCheckedAt).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {!readOnly && (
            <>
              <Button variant="outline" size="sm" onClick={handleCheckPositions} disabled={checking}>
                <RefreshCw className={`h-4 w-4 mr-1 ${checking ? "animate-spin" : ""}`} />
                {checking ? "Verificando..." : "Verificar Posições"}
              </Button>
              <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-1" /> Importar em Lote
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importar Palavras-Chave em Lote</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    Cole as palavras-chave, uma por linha. Formato: <code>palavra-chave TAB volume TAB cpc</code> ou <code>palavra-chave;volume;cpc</code>.
                  </p>
                  <Textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={"consultoria seo\t1200\t3.50\nbacklinks baratos\t800\t2.10"}
                    rows={10}
                  />
                  <Button onClick={handleBulkImport} disabled={bulkLoading || !bulkText.trim()}>
                    {bulkLoading ? "Importando..." : "Importar"}
                  </Button>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 sticky left-0 bg-background z-10">#</TableHead>
                <TableHead className="min-w-[180px] sticky left-12 bg-background z-10">Palavra-chave</TableHead>
                <TableHead className="w-24">Volume</TableHead>
                <TableHead className="w-24">CPC</TableHead>
                {months.map(m => (
                  <TableHead key={m} className="w-20 text-center whitespace-nowrap">{formatMonthLabel(m)}</TableHead>
                ))}
                {!readOnly && <TableHead className="w-24" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={fixedColCount + months.length} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : keywords.length === 0 && readOnly ? (
                <TableRow><TableCell colSpan={fixedColCount + months.length} className="text-center py-8 text-muted-foreground">Nenhuma palavra-chave cadastrada</TableCell></TableRow>
              ) : (
                <>
                  {keywords.map((kw, idx) => (
                    <TableRow key={kw.id}>
                      <TableCell className="text-muted-foreground sticky left-0 bg-background z-10">{idx + 1}</TableCell>
                      {editingId === kw.id ? (
                        <>
                          <TableCell className="sticky left-12 bg-background z-10">
                            <Input value={editValues.keyword} onChange={(e) => setEditValues(v => ({ ...v, keyword: e.target.value }))} className="h-8" onKeyDown={(e) => e.key === "Enter" && saveEdit()} />
                          </TableCell>
                          <TableCell>
                            <Input value={editValues.volume} onChange={(e) => setEditValues(v => ({ ...v, volume: e.target.value }))} className="h-8" type="number" />
                          </TableCell>
                          <TableCell>
                            <Input value={editValues.cpc} onChange={(e) => setEditValues(v => ({ ...v, cpc: e.target.value }))} className="h-8" type="number" step="0.01" />
                          </TableCell>
                          {months.map(m => (
                            <TableCell key={m} className="text-center text-muted-foreground">—</TableCell>
                          ))}
                          <TableCell className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={saveEdit}><Check className="h-4 w-4 text-green-600" /></Button>
                            <Button size="icon" variant="ghost" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium sticky left-12 bg-background z-10">{kw.keyword}</TableCell>
                          <TableCell>{kw.volume.toLocaleString("pt-BR")}</TableCell>
                          <TableCell>R$ {Number(kw.cpc).toFixed(2)}</TableCell>
                          {months.map((m, mIdx) => {
                            const pos = snapshotMap[kw.id]?.[m] ?? null;
                            const prevMonthPos = mIdx > 0 ? (snapshotMap[kw.id]?.[months[mIdx - 1]] ?? null) : null;
                            const color = getPositionColor(pos, prevMonthPos);
                            return (
                              <TableCell key={m} className={`text-center tabular-nums ${color}`}>
                                {pos !== null ? pos : "—"}
                              </TableCell>
                            );
                          })}
                          {!readOnly && (
                            <TableCell className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => startEdit(kw)}><Pencil className="h-4 w-4" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDelete(kw.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </TableCell>
                          )}
                        </>
                      )}
                    </TableRow>
                  ))}
                  {!readOnly && (
                    <TableRow>
                      <TableCell className="text-muted-foreground sticky left-0 bg-background z-10">{keywords.length + 1}</TableCell>
                      <TableCell className="sticky left-12 bg-background z-10">
                        <Input value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} placeholder="Nova palavra-chave" className="h-8" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
                      </TableCell>
                      <TableCell>
                        <Input value={newVolume} onChange={(e) => setNewVolume(e.target.value)} placeholder="0" className="h-8" type="number" />
                      </TableCell>
                      <TableCell>
                        <Input value={newCpc} onChange={(e) => setNewCpc(e.target.value)} placeholder="0.00" className="h-8" type="number" step="0.01" />
                      </TableCell>
                      {months.map(m => (
                        <TableCell key={m} />
                      ))}
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={handleAdd}><Plus className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
