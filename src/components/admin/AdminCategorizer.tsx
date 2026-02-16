import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, CheckCircle2, XCircle, SkipForward } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BATCH_SIZE = 5;
const DELAY_BETWEEN_BATCHES_MS = 2000;

type LogEntry = {
  domain: string;
  old_category: string;
  new_category: string;
  status: "updated" | "skipped" | "error";
  error?: string;
};

type Stats = {
  total: number;
  processed: number;
  updated: number;
  skipped: number;
  errors: number;
};

export default function AdminCategorizer() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [stats, setStats] = useState<Stats>({ total: 0, processed: 0, updated: 0, skipped: 0, errors: 0 });
  const [log, setLog] = useState<LogEntry[]>([]);
  const pauseRef = useRef(false);
  const abortRef = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  const fetchGeralSites = useCallback(async () => {
    const { count } = await supabase
      .from("backlinks")
      .select("*", { count: "exact", head: true })
      .or("category.eq.Geral,category.is.null");
    return count || 0;
  }, []);

  const fetchBatch = useCallback(async (offset: number) => {
    const { data } = await supabase
      .from("backlinks")
      .select("id, url, domain")
      .or("category.eq.Geral,category.is.null")
      .range(offset, offset + BATCH_SIZE - 1);
    return data || [];
  }, []);

  const processBatch = useCallback(async (sites: Array<{ id: string; url: string; domain: string }>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Sessão expirada");

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/categorize-backlinks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ sites }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Erro na requisição" }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    const { results } = await response.json();
    return results as LogEntry[];
  }, []);

  const startCategorization = useCallback(async () => {
    setIsRunning(true);
    setIsPaused(false);
    setIsFinished(false);
    setLog([]);
    pauseRef.current = false;
    abortRef.current = false;

    const total = await fetchGeralSites();
    setStats({ total, processed: 0, updated: 0, skipped: 0, errors: 0 });

    if (total === 0) {
      toast({ title: "Nenhum site para categorizar", description: "Todos os sites já possuem categoria." });
      setIsRunning(false);
      setIsFinished(true);
      return;
    }

    let processed = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    while (processed < total) {
      if (abortRef.current) break;

      // Wait while paused
      while (pauseRef.current) {
        await new Promise((r) => setTimeout(r, 500));
        if (abortRef.current) break;
      }
      if (abortRef.current) break;

      try {
        // Always fetch from offset 0 since processed items change category
        const batch = await fetchBatch(0);
        if (batch.length === 0) break;

        const results = await processBatch(batch);

        for (const r of results) {
          if (r.status === "updated") updated++;
          else if (r.status === "skipped") skipped++;
          else errors++;
          processed++;
        }

        setLog((prev) => [...prev, ...results]);
        setStats({ total, processed, updated, skipped, errors });
      } catch (err) {
        console.error("Batch error:", err);
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        toast({ title: "Erro no lote", description: msg });
        errors++;
        processed += BATCH_SIZE;
        setStats({ total, processed: Math.min(processed, total), updated, skipped, errors });
      }

      // Delay between batches
      if (processed < total) {
        await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
      }
    }

    setIsRunning(false);
    setIsFinished(true);
    toast({
      title: "Categorização concluída!",
      description: `${updated} atualizados, ${skipped} mantidos, ${errors} erros`,
    });
  }, [fetchGeralSites, fetchBatch, processBatch]);

  const togglePause = () => {
    pauseRef.current = !pauseRef.current;
    setIsPaused(!isPaused);
  };

  const stopProcess = () => {
    abortRef.current = true;
    pauseRef.current = false;
    setIsPaused(false);
  };

  const progressPercent = stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0;

  const statusIcon = (status: string) => {
    if (status === "updated") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === "skipped") return <SkipForward className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Categorizar Sites Automaticamente</CardTitle>
        <CardDescription>
          Usa Firecrawl + AI para analisar o conteúdo de cada site e atribuir a categoria correta automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          {!isRunning ? (
            <Button onClick={startCategorization} disabled={isRunning}>
              <Play className="h-4 w-4 mr-1" />
              {isFinished ? "Reiniciar" : "Iniciar Categorização"}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={togglePause}>
                {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                {isPaused ? "Retomar" : "Pausar"}
              </Button>
              <Button variant="destructive" onClick={stopProcess}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Parar
              </Button>
            </>
          )}
        </div>

        {/* Progress */}
        {(isRunning || isFinished) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{stats.processed} / {stats.total} sites processados</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} />
            <div className="flex gap-3 text-xs flex-wrap">
              <Badge variant="outline" className="text-green-600 border-green-300">
                ✓ {stats.updated} atualizados
              </Badge>
              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                → {stats.skipped} mantidos
              </Badge>
              <Badge variant="outline" className="text-red-600 border-red-300">
                ✕ {stats.errors} erros
              </Badge>
            </div>
          </div>
        )}

        {/* Log */}
        {log.length > 0 && (
          <ScrollArea className="h-64 border rounded-md">
            <div className="p-3 space-y-1 text-sm font-mono">
              {log.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  {statusIcon(entry.status)}
                  <span className="truncate max-w-[200px]" title={entry.domain}>
                    {entry.domain}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="secondary" className="text-xs">
                    {entry.new_category}
                  </Badge>
                  {entry.error && (
                    <span className="text-destructive text-xs truncate" title={entry.error}>
                      {entry.error}
                    </span>
                  )}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
