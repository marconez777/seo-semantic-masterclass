import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, Trash2 } from "lucide-react";

interface WebinarSignup {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  especialidade: string;
  faturamento: string;
  source: string;
  created_at: string;
}

export default function AdminWebinar() {
  const { toast } = useToast();
  const [rows, setRows] = useState<WebinarSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("webinar_signups")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar", description: error.message });
    } else {
      setRows((data ?? []) as WebinarSignup[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta inscrição?")) return;
    const { error } = await supabase.from("webinar_signups").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message });
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Inscrição excluída" });
  };

  const exportCSV = () => {
    const header = ["Nome", "Email", "WhatsApp", "Especialidade", "Faturamento", "Origem", "Data"];
    const lines = filtered.map((r) => [
      r.nome,
      r.email,
      r.whatsapp,
      r.especialidade,
      r.faturamento,
      r.source,
      new Date(r.created_at).toLocaleString("pt-BR"),
    ]);
    const csv = [header, ...lines]
      .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webinar-signups-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const term = q.toLowerCase();
    return (
      r.nome.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.whatsapp.toLowerCase().includes(term) ||
      r.especialidade.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inscrições do Webinar</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} {rows.length === 1 ? "inscrição" : "inscrições"} no total
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" disabled={!filtered.length}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, email, whatsapp..."
          className="pl-9"
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Faturamento</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhuma inscrição encontrada
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.nome}</TableCell>
                  <TableCell>
                    <a href={`mailto:${r.email}`} className="text-primary hover:underline">
                      {r.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://wa.me/${r.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {r.whatsapp}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.especialidade}</Badge>
                  </TableCell>
                  <TableCell>{r.faturamento}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(r.id)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
