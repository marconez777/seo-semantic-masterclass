import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewProjectModal } from "./NewProjectModal";
import { AddKeywordForm } from "./AddKeywordForm";
import { toast } from "@/hooks/use-toast";
import { Plus, RefreshCw, Trash2, Search } from "lucide-react";

interface KeywordProject {
  id: string;
  name: string;
  domain: string;
  region: string;
  device: string;
  created_at: string;
}

interface TrackedKeyword {
  id: string;
  keyword: string;
  current_position: number | null;
  previous_position: number | null;
  best_position: number | null;
  last_checked_at: string | null;
}

interface MonthlySnapshot {
  keyword_id: string;
  month: string;
  position: number | null;
}

interface Props {
  userId: string;
}

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatMonthLabel(monthStr: string): string {
  const d = new Date(monthStr + "T00:00:00");
  return `${MONTH_LABELS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
}

function getPositionColor(
  position: number | null,
  prevPosition: number | null,
  isFirstMonth: boolean
): string {
  if (position === null) return "text-muted-foreground";
  if (isFirstMonth || prevPosition === null) return "text-muted-foreground";
  if (position < prevPosition) return "text-green-600 font-medium"; // subiu (menor = melhor)
  if (position > prevPosition) return "text-orange-500 font-medium"; // desceu
  return "text-muted-foreground"; // igual
}

export function KeywordTracker({ userId }: Props) {
  const [projects, setProjects] = useState<KeywordProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([]);
  const [snapshots, setSnapshots] = useState<MonthlySnapshot[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [checking, setChecking] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const MAX_FREE_PROJECTS = 1;
  const canCreate = projects.length < MAX_FREE_PROJECTS;

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    const { data } = await supabase
      .from("keyword_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    const list = (data as KeywordProject[]) || [];
    setProjects(list);
    if (list.length > 0 && !selectedProjectId) {
      setSelectedProjectId(list[0].id);
    }
    setLoadingProjects(false);
  }, [userId, selectedProjectId]);

  const fetchKeywords = useCallback(async () => {
    if (!selectedProjectId) return;
    const { data } = await supabase
      .from("tracked_keywords")
      .select("*")
      .eq("project_id", selectedProjectId)
      .order("created_at", { ascending: true });
    setKeywords((data as TrackedKeyword[]) || []);
  }, [selectedProjectId]);

  const fetchSnapshots = useCallback(async () => {
    if (!selectedProjectId || keywords.length === 0) {
      setSnapshots([]);
      return;
    }
    const keywordIds = keywords.map((k) => k.id);
    const { data } = await (supabase as any)
      .from("keyword_monthly_snapshots")
      .select("keyword_id, month, position")
      .in("keyword_id", keywordIds)
      .order("month", { ascending: true });
    setSnapshots((data as MonthlySnapshot[]) || []);
  }, [selectedProjectId, keywords]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  // Compute unique sorted months from snapshots
  const months = useMemo(() => {
    const set = new Set(snapshots.map((s) => s.month));
    return Array.from(set).sort();
  }, [snapshots]);

  // Build a lookup: keyword_id -> month -> position
  const snapshotMap = useMemo(() => {
    const map: Record<string, Record<string, number | null>> = {};
    for (const s of snapshots) {
      if (!map[s.keyword_id]) map[s.keyword_id] = {};
      map[s.keyword_id][s.month] = s.position;
    }
    return map;
  }, [snapshots]);

  const handleCheckPositions = async () => {
    if (!selectedProjectId) return;
    setChecking(true);
    try {
      const res = await supabase.functions.invoke("serpbot-proxy", {
        body: { action: "check_project", project_id: selectedProjectId },
      });
      if (res.error) throw res.error;
      toast({ title: "Verificação concluída!", description: `${res.data?.results?.length || 0} palavras verificadas.` });
      await fetchKeywords();
      // Snapshots will refetch via useEffect dependency on keywords
    } catch (err: any) {
      toast({ title: "Erro na verificação", description: err.message || String(err) });
    } finally {
      setChecking(false);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    await supabase.from("tracked_keywords").delete().eq("id", id);
    fetchKeywords();
  };

  const handleDeleteProject = async (id: string) => {
    await supabase.from("keyword_projects").delete().eq("id", id);
    setSelectedProjectId(null);
    fetchProjects();
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Get the most recent last_checked_at across all keywords
  const lastCheckedAt = useMemo(() => {
    const dates = keywords
      .map((k) => k.last_checked_at)
      .filter(Boolean) as string[];
    if (dates.length === 0) return null;
    return dates.sort().reverse()[0];
  }, [keywords]);

  return (
    <div className="space-y-6">
      {/* Project selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {projects.map((p) => (
            <Button
              key={p.id}
              variant={selectedProjectId === p.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedProjectId(p.id)}
            >
              {p.name}
            </Button>
          ))}
          {projects.length === 0 && !loadingProjects && (
            <p className="text-muted-foreground text-sm">Nenhum projeto criado ainda.</p>
          )}
        </div>
        <Button size="sm" onClick={() => setShowNewProject(true)} disabled={!canCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Novo Projeto
        </Button>
      </div>

      {!canCreate && projects.length >= MAX_FREE_PROJECTS && (
        <p className="text-xs text-muted-foreground">Você atingiu o limite de {MAX_FREE_PROJECTS} projeto grátis. Em breve teremos planos pagos.</p>
      )}

      {/* Selected project details */}
      {selectedProject && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-lg">{selectedProject.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedProject.domain} · {selectedProject.region} · {selectedProject.device}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCheckPositions} disabled={checking || keywords.length === 0}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${checking ? "animate-spin" : ""}`} />
                    {checking ? "Verificando..." : "Verificar Posições"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(selectedProject.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {lastCheckedAt && (
                  <p className="text-xs text-muted-foreground">
                    Última checagem: {new Date(lastCheckedAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddKeywordForm
              projectId={selectedProject.id}
              currentCount={keywords.length}
              onAdded={fetchKeywords}
            />

            {keywords.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Palavra-chave</TableHead>
                      <TableHead className="text-center w-24">Posição</TableHead>
                      {months.map((m) => (
                        <TableHead key={m} className="text-center w-20 text-xs">
                          {formatMonthLabel(m)}
                        </TableHead>
                      ))}
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywords.map((kw) => {
                      const kwSnapshots = snapshotMap[kw.id] || {};
                      return (
                        <TableRow key={kw.id}>
                          <TableCell className="font-medium">{kw.keyword}</TableCell>
                          <TableCell className="text-center">
                            {kw.current_position !== null ? (
                              <Badge variant={kw.current_position <= 10 ? "default" : "secondary"}>
                                {kw.current_position}º
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          {months.map((m, idx) => {
                            const pos = kwSnapshots[m] ?? null;
                            const prevMonth = idx > 0 ? months[idx - 1] : null;
                            const prevPos = prevMonth ? (kwSnapshots[prevMonth] ?? null) : null;
                            const isFirst = idx === 0;
                            const colorClass = getPositionColor(pos, prevPos, isFirst);

                            return (
                              <TableCell key={m} className={`text-center text-sm ${colorClass}`}>
                                {pos !== null ? `${pos}º` : "—"}
                              </TableCell>
                            );
                          })}
                          <TableCell>
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteKeyword(kw.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Adicione palavras-chave para começar a rastrear.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <NewProjectModal
        open={showNewProject}
        onOpenChange={setShowNewProject}
        userId={userId}
        onCreated={() => {
          fetchProjects();
        }}
        canCreate={canCreate}
      />
    </div>
  );
}
