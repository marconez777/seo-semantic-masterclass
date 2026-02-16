import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, ChevronLeft, ChevronRight, Trash2, Edit2, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Props {
  clientId: string;
  readOnly?: boolean;
}

interface Task {
  id: string;
  client_id: string;
  column_key: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  status: string;
  position: number | null;
  created_at: string;
}

const COLUMNS = [
  { key: "pesquisa", label: "Pesquisa de Palavras-chave" },
  { key: "redacao", label: "Redação e Otimização SEO" },
  { key: "publicacao", label: "Publicação de Páginas" },
  { key: "backlinks", label: "Backlinks do Mês" },
  { key: "blog", label: "Blog do Mês" },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

const COLUMN_COLORS: Record<ColumnKey, string> = {
  pesquisa: "border-t-blue-500",
  redacao: "border-t-amber-500",
  publicacao: "border-t-emerald-500",
  backlinks: "border-t-purple-500",
  blog: "border-t-rose-500",
};

function getTaskStatusInfo(task: Task) {
  if (task.status === "concluida" || task.completed_at) {
    return { label: "Concluída", variant: "success" as const, icon: CheckCircle2 };
  }
  if (task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))) {
    return { label: "Atrasada", variant: "destructive" as const, icon: AlertTriangle };
  }
  if (task.status === "em_andamento") {
    return { label: "Em andamento", variant: "default" as const, icon: Clock };
  }
  return { label: "Pendente", variant: "secondary" as const, icon: Clock };
}

export function ConsultingTaskBoard({ clientId, readOnly = false }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [targetColumn, setTargetColumn] = useState<ColumnKey>("pesquisa");
  const [form, setForm] = useState({ title: "", description: "", due_date: "", status: "pendente" });

  async function fetchTasks() {
    const { data } = await supabase
      .from("consulting_tasks")
      .select("*")
      .eq("client_id", clientId)
      .order("position", { ascending: true });
    setTasks((data as Task[]) || []);
    setLoading(false);
  }

  useEffect(() => { fetchTasks(); }, [clientId]);

  function openAdd(colKey: ColumnKey) {
    setEditingTask(null);
    setTargetColumn(colKey);
    setForm({ title: "", description: "", due_date: "", status: "pendente" });
    setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setTargetColumn(task.column_key as ColumnKey);
    setForm({
      title: task.title,
      description: task.description || "",
      due_date: task.due_date || "",
      status: task.status,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    if (editingTask) {
      const updates: any = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        due_date: form.due_date || null,
        status: form.status,
        completed_at: form.status === "concluida" ? new Date().toISOString() : null,
      };
      const { error } = await supabase.from("consulting_tasks").update(updates).eq("id", editingTask.id);
      if (error) { toast.error("Erro ao atualizar tarefa"); return; }
      toast.success("Tarefa atualizada");
    } else {
      const colTasks = tasks.filter((t) => t.column_key === targetColumn);
      const { error } = await supabase.from("consulting_tasks").insert({
        client_id: clientId,
        column_key: targetColumn,
        title: form.title.trim(),
        description: form.description.trim() || null,
        due_date: form.due_date || null,
        status: form.status,
        position: colTasks.length,
        completed_at: form.status === "concluida" ? new Date().toISOString() : null,
      });
      if (error) { toast.error("Erro ao criar tarefa"); return; }
      toast.success("Tarefa criada");
    }
    setDialogOpen(false);
    fetchTasks();
  }

  async function handleDelete(id: string) {
    await supabase.from("consulting_tasks").delete().eq("id", id);
    toast.success("Tarefa removida");
    fetchTasks();
  }

  async function moveTask(task: Task, direction: "left" | "right") {
    const idx = COLUMNS.findIndex((c) => c.key === task.column_key);
    const newIdx = direction === "left" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= COLUMNS.length) return;
    const newCol = COLUMNS[newIdx].key;
    const newPosition = tasks.filter((t) => t.column_key === newCol).length;
    await supabase.from("consulting_tasks").update({ column_key: newCol, position: newPosition }).eq("id", task.id);
    fetchTasks();
  }

  if (loading) return <div className="p-6 text-muted-foreground">Carregando tarefas...</div>;

  return (
    <div className="space-y-4">
      <ScrollArea className="w-full">
        <div className="flex gap-3 min-w-[1100px] pb-4">
          {COLUMNS.map((col, colIdx) => {
            const colTasks = tasks.filter((t) => t.column_key === col.key);
            return (
              <div key={col.key} className="flex-1 min-w-[210px]">
                <Card className={`border-t-4 ${COLUMN_COLORS[col.key]} bg-muted/30`}>
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-semibold uppercase tracking-wide truncate">
                        {col.label}
                      </CardTitle>
                      <Badge variant="secondary" className="text-[10px] ml-1">{colTasks.length}</Badge>
                    </div>
                    {!readOnly && (
                      <Button variant="ghost" size="sm" className="w-full mt-1 h-7 text-xs" onClick={() => openAdd(col.key)}>
                        <Plus className="h-3 w-3 mr-1" /> Tarefa
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-2 pt-0 space-y-2 min-h-[120px]">
                    {colTasks.map((task) => {
                      const info = getTaskStatusInfo(task);
                      const StatusIcon = info.icon;
                      return (
                        <Card key={task.id} className="p-2.5 shadow-sm">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-sm font-medium leading-tight flex-1">{task.title}</p>
                            <Badge variant={info.variant} className="text-[9px] shrink-0 flex items-center gap-0.5">
                              <StatusIcon className="h-2.5 w-2.5" />
                              {info.label}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                          )}
                          {task.due_date && (
                            <p className={`text-[10px] mt-1.5 ${info.variant === "destructive" ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                              Prazo: {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          )}
                          {!readOnly && (
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t">
                              <div className="flex gap-0.5">
                                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={colIdx === 0} onClick={() => moveTask(task, "left")}>
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={colIdx === COLUMNS.length - 1} onClick={() => moveTask(task, "right")}>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <div className="flex gap-0.5">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(task)}>
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(task.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Título da tarefa" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Descrição (opcional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Data prevista</label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>{editingTask ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
