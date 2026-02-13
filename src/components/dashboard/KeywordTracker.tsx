import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewProjectModal } from "./NewProjectModal";
import { AddKeywordForm } from "./AddKeywordForm";
import { toast } from "@/hooks/use-toast";
import { Plus, RefreshCw, Trash2, ArrowUp, ArrowDown, Minus, Search } from "lucide-react";

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

interface Props {
  userId: string;
}

export function KeywordTracker({ userId }: Props) {
  const [projects, setProjects] = useState<KeywordProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([]);
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

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  const handleCheckPositions = async () => {
    if (!selectedProjectId) return;
    setChecking(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("serpbot-proxy", {
        body: { action: "check_project", project_id: selectedProjectId },
      });

      if (res.error) throw res.error;
      toast({ title: "Verificação concluída!", description: `${res.data?.results?.length || 0} palavras verificadas.` });
      await fetchKeywords();
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

  const renderPositionChange = (current: number | null, previous: number | null) => {
    if (current === null) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (previous === null) return <Badge variant="secondary">Novo</Badge>;
    const diff = previous - current; // positive = improved
    if (diff > 0) return <span className="flex items-center gap-1 text-secondary font-medium"><ArrowUp className="h-4 w-4" />+{diff}</span>;
    if (diff < 0) return <span className="flex items-center gap-1 text-destructive font-medium"><ArrowDown className="h-4 w-4" />{diff}</span>;
    return <span className="flex items-center gap-1 text-muted-foreground"><Minus className="h-4 w-4" />0</span>;
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

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
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCheckPositions} disabled={checking || keywords.length === 0}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${checking ? "animate-spin" : ""}`} />
                  {checking ? "Verificando..." : "Verificar Posições"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(selectedProject.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
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
                      <TableHead className="text-center w-24">Variação</TableHead>
                      <TableHead className="text-center w-24">Melhor</TableHead>
                      <TableHead className="text-center w-20">Últ. Check</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywords.map((kw) => (
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
                        <TableCell className="text-center">
                          {renderPositionChange(kw.current_position, kw.previous_position)}
                        </TableCell>
                        <TableCell className="text-center">
                          {kw.best_position !== null ? `${kw.best_position}º` : "—"}
                        </TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {kw.last_checked_at
                            ? new Date(kw.last_checked_at).toLocaleDateString("pt-BR")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteKeyword(kw.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
