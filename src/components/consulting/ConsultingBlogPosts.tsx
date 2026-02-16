import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Props {
  clientId: string;
  readOnly: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  url: string | null;
  status: string;
  published_at: string | null;
  month: string | null;
}

export function ConsultingBlogPosts({ clientId, readOnly }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", url: "", status: "pendente" });

  const monthStr = format(selectedMonth, "yyyy-MM-dd");

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase
      .from("consulting_blog_posts")
      .select("*")
      .eq("client_id", clientId)
      .eq("month", monthStr)
      .order("created_at", { ascending: true });
    setPosts(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchPosts(); }, [clientId, monthStr]);

  function openNew() {
    setEditingId(null);
    setForm({ title: "", url: "", status: "pendente" });
    setDialogOpen(true);
  }

  function openEdit(p: BlogPost) {
    setEditingId(p.id);
    setForm({ title: p.title, url: p.url || "", status: p.status });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Título é obrigatório"); return; }
    if (editingId) {
      const { error } = await supabase.from("consulting_blog_posts").update({
        title: form.title,
        url: form.url || null,
        status: form.status,
        published_at: form.status === "publicado" ? new Date().toISOString() : null,
      }).eq("id", editingId);
      if (error) { toast.error("Erro ao atualizar"); return; }
      toast.success("Post atualizado");
    } else {
      const { error } = await supabase.from("consulting_blog_posts").insert({
        client_id: clientId,
        month: monthStr,
        title: form.title,
        url: form.url || null,
        status: form.status,
        published_at: form.status === "publicado" ? new Date().toISOString() : null,
      });
      if (error) { toast.error("Erro ao criar post"); return; }
      toast.success("Post adicionado");
    }
    setDialogOpen(false);
    fetchPosts();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("consulting_blog_posts").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Post excluído");
    fetchPosts();
  }

  const publishedCount = posts.filter(p => p.status === "publicado").length;

  return (
    <div className="space-y-4">
      {/* Month nav + stats */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedMonth(m => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold capitalize min-w-[140px] text-center">
            {format(selectedMonth, "MMMM yyyy", { locale: ptBR })}
          </span>
          <Button variant="outline" size="icon" onClick={() => setSelectedMonth(m => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{posts.length} posts</Badge>
          <Badge variant="default">{publishedCount} publicados</Badge>
          {!readOnly && (
            <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Novo Post</Button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-muted-foreground text-sm py-8 text-center">Carregando...</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">Nenhum post neste mês.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              {!readOnly && <TableHead className="w-24">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((p, i) => (
              <TableRow key={p.id}>
                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-sm">
                      {new URL(p.url).pathname.slice(0, 40)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : <span className="text-muted-foreground text-sm">—</span>}
                </TableCell>
                <TableCell>
                  <Badge variant={p.status === "publicado" ? "success" : "pending"}>
                    {p.status}
                  </Badge>
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Post" : "Novo Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Título do post" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Input placeholder="URL (opcional)" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            <div className="flex gap-2">
              {["pendente", "publicado"].map(s => (
                <Button key={s} size="sm" variant={form.status === s ? "default" : "outline"} onClick={() => setForm(f => ({ ...f, status: s }))}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
