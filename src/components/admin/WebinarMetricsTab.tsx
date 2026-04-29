import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Smartphone, Monitor, Tablet, Download } from "lucide-react";
import { WebinarSessionDetailDrawer } from "./WebinarSessionDetailDrawer";

interface SessionRow {
  id: string;
  session_id: string;
  signup_id: string | null;
  first_seen_at: string;
  last_seen_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  device_type: string | null;
  os: string | null;
  browser: string | null;
  ip_country: string | null;
  video_started: boolean;
  video_watch_seconds: number;
  video_max_position_seconds: number;
  video_duration_seconds: number;
  video_completion_pct: number;
  video_completed: boolean;
  unmuted: boolean;
  went_fullscreen: boolean;
  max_speed: number;
  cta_clicks: number;
  cta_hero_clicks: number;
  cta_learn_clicks: number;
  cta_final_clicks: number;
  cta_sticky_clicks: number;
  first_cta_clicked: string | null;
  signup_modal_opened: boolean;
  signup_step_reached: number;
  signup_completed: boolean;
  signup_qualified: boolean;
  reached_thank_you: boolean;
  thank_you_at: string | null;
  whatsapp_group_clicked: boolean;
  total_time_on_page_seconds: number;
  scroll_depth_pct: number;
  // join
  signup_nome?: string | null;
  signup_email?: string | null;
}

type Period = "7" | "30" | "all";

const formatDuration = (s: number) => {
  if (!s) return "0s";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  return `${m}m ${sec}s`;
};

const DeviceIcon = ({ d }: { d: string | null }) => {
  if (d === "mobile") return <Smartphone className="w-4 h-4" />;
  if (d === "tablet") return <Tablet className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
};

export function WebinarMetricsTab() {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30");
  const [q, setQ] = useState("");
  const [openSession, setOpenSession] = useState<SessionRow | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      let query = supabase
        .from("webinar_sessions" as any)
        .select("*")
        .order("first_seen_at", { ascending: false })
        .limit(1000);

      if (period !== "all") {
        const days = parseInt(period, 10);
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("first_seen_at", since);
      }

      const { data: sessions } = await query;
      const list = (sessions ?? []) as any as SessionRow[];

      // Buscar nomes dos signups associados
      const signupIds = list.map((s) => s.signup_id).filter(Boolean) as string[];
      let signupMap: Record<string, { nome: string; email: string }> = {};
      if (signupIds.length) {
        const { data: signups } = await supabase
          .from("webinar_signups")
          .select("id, nome, email")
          .in("id", signupIds);
        for (const s of signups ?? []) {
          signupMap[s.id] = { nome: s.nome, email: s.email };
        }
      }

      // Também tentar amarrar via session_id (caso signup_id ainda não esteja preenchido na sessão)
      const sessionIds = list.map((s) => s.session_id);
      const { data: signupsBySession } = await (supabase as any)
        .from("webinar_signups")
        .select("id, nome, email, session_id")
        .in("session_id", sessionIds);
      const bySession: Record<string, { id: string; nome: string; email: string }> = {};
      for (const s of (signupsBySession ?? []) as any[]) {
        if (s.session_id) bySession[s.session_id] = { id: s.id, nome: s.nome, email: s.email };
      }

      for (const r of list) {
        if (r.signup_id && signupMap[r.signup_id]) {
          r.signup_nome = signupMap[r.signup_id].nome;
          r.signup_email = signupMap[r.signup_id].email;
        } else if (bySession[r.session_id]) {
          r.signup_id = bySession[r.session_id].id;
          r.signup_nome = bySession[r.session_id].nome;
          r.signup_email = bySession[r.session_id].email;
        }
      }

      setRows(list);
      setLoading(false);
    };
    fetchData();
  }, [period]);

  // Filtro
  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    return (
      (r.signup_nome ?? "").toLowerCase().includes(t) ||
      (r.signup_email ?? "").toLowerCase().includes(t) ||
      (r.utm_source ?? "").toLowerCase().includes(t) ||
      (r.utm_campaign ?? "").toLowerCase().includes(t) ||
      (r.device_type ?? "").toLowerCase().includes(t) ||
      (r.referrer ?? "").toLowerCase().includes(t) ||
      r.session_id.toLowerCase().includes(t)
    );
  });

  // Métricas agregadas
  const total = rows.length;
  const startedVideo = rows.filter((r) => r.video_started).length;
  const completedVideo = rows.filter((r) => r.video_completed).length;
  const ctaClicked = rows.filter((r) => r.cta_clicks > 0).length;
  const modalOpened = rows.filter((r) => r.signup_modal_opened).length;
  const signedUp = rows.filter((r) => r.signup_completed).length;
  const qualified = rows.filter((r) => r.signup_qualified).length;
  const reachedThankYou = rows.filter((r) => r.reached_thank_you).length;
  const joinedWhatsApp = rows.filter((r) => r.whatsapp_group_clicked).length;

  const avgWatch =
    startedVideo > 0
      ? Math.round(
          rows.filter((r) => r.video_started).reduce((a, r) => a + r.video_watch_seconds, 0) /
            startedVideo
        )
      : 0;

  const ctaTotals = rows.reduce(
    (acc, r) => {
      acc.hero += r.cta_hero_clicks;
      acc.learn += r.cta_learn_clicks;
      acc.final += r.cta_final_clicks;
      acc.sticky += r.cta_sticky_clicks;
      return acc;
    },
    { hero: 0, learn: 0, final: 0, sticky: 0 }
  );

  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

  // Top devices / sources
  const topBy = (key: keyof SessionRow) => {
    const counts: Record<string, number> = {};
    for (const r of rows) {
      const k = (r[key] as string) || "(direto)";
      counts[k] = (counts[k] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  };

  const topDevices = topBy("device_type");
  const topSources = topBy("utm_source");
  const topReferrers = topBy("referrer");

  const exportCSV = () => {
    const header = [
      "session_id", "data", "device", "os", "browser", "país",
      "utm_source", "utm_campaign", "referrer",
      "vídeo_iniciou", "vídeo_assistido_seg", "vídeo_max_seg", "vídeo_completou_pct", "fullscreen", "velocidade_max",
      "cta_total", "cta_hero", "cta_learn", "cta_final", "cta_sticky", "primeiro_cta",
      "abriu_modal", "step_atingido", "completou_inscrição", "qualificado",
      "chegou_obrigado", "obrigado_em", "clicou_whatsapp",
      "tempo_pagina_seg", "scroll_pct",
      "lead_nome", "lead_email",
    ];
    const lines = filtered.map((r) => [
      r.session_id,
      new Date(r.first_seen_at).toLocaleString("pt-BR"),
      r.device_type, r.os, r.browser, r.ip_country,
      r.utm_source, r.utm_campaign, r.referrer,
      r.video_started ? "sim" : "não",
      r.video_watch_seconds, r.video_max_position_seconds, r.video_completion_pct,
      r.went_fullscreen ? "sim" : "não", r.max_speed,
      r.cta_clicks, r.cta_hero_clicks, r.cta_learn_clicks, r.cta_final_clicks, r.cta_sticky_clicks, r.first_cta_clicked,
      r.signup_modal_opened ? "sim" : "não",
      r.signup_step_reached,
      r.signup_completed ? "sim" : "não",
      r.signup_qualified ? "sim" : "não",
      r.reached_thank_you ? "sim" : "não",
      r.thank_you_at ? new Date(r.thank_you_at).toLocaleString("pt-BR") : "",
      r.whatsapp_group_clicked ? "sim" : "não",
      r.total_time_on_page_seconds, r.scroll_depth_pct,
      r.signup_nome ?? "", r.signup_email ?? "",
    ]);
    const csv = [header, ...lines]
      .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webinar-metricas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportCSV} variant="outline" disabled={!filtered.length}>
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      {/* Cards de visão geral */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Visitantes únicos" value={total.toString()} />
        <MetricCard label="Iniciaram o vídeo" value={`${startedVideo} (${pct(startedVideo, total)}%)`} />
        <MetricCard label="Tempo médio assistido" value={formatDuration(avgWatch)} />
        <MetricCard label="Completaram vídeo" value={`${completedVideo} (${pct(completedVideo, total)}%)`} />
        <MetricCard label="Cliques em CTA" value={`${rows.reduce((a, r) => a + r.cta_clicks, 0)}`} sub={`${ctaClicked} pessoas`} />
        <MetricCard label="Modais abertos" value={modalOpened.toString()} sub={`${pct(modalOpened, total)}% dos visitantes`} />
        <MetricCard label="Inscrições" value={signedUp.toString()} sub={`Conv: ${pct(signedUp, total)}%`} />
        <MetricCard label="Qualificados" value={qualified.toString()} sub={`${pct(qualified, signedUp)}% das inscrições`} />
        <MetricCard label="Chegou na pág. obrigado" value={reachedThankYou.toString()} sub={`${pct(reachedThankYou, signedUp)}% dos inscritos`} />
        <MetricCard label="Entrou no WhatsApp" value={joinedWhatsApp.toString()} sub={`${pct(joinedWhatsApp, reachedThankYou)}% dos que chegaram`} />
      </div>

      {/* Funil */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funil de conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <FunnelStep label="Visitou a página" value={total} base={total} />
          <FunnelStep label="Assistiu ao vídeo" value={startedVideo} base={total} />
          <FunnelStep label="Clicou em algum CTA" value={ctaClicked} base={total} />
          <FunnelStep label="Abriu o modal de inscrição" value={modalOpened} base={total} />
          <FunnelStep label="Completou inscrição" value={signedUp} base={total} />
          <FunnelStep label="Qualificado (psiquiatra + faturamento)" value={qualified} base={total} />
          <FunnelStep label="Chegou na página de obrigado" value={reachedThankYou} base={total} />
          <FunnelStep label="Clicou para entrar no WhatsApp" value={joinedWhatsApp} base={total} />
        </CardContent>
      </Card>

      {/* Breakdown CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliques por CTA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <BreakRow label="Hero (topo)" value={ctaTotals.hero} />
            <BreakRow label="Learn (meio)" value={ctaTotals.learn} />
            <BreakRow label="Final (rodapé)" value={ctaTotals.final} />
            <BreakRow label="Sticky (barra fixa)" value={ctaTotals.sticky} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top dispositivos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topDevices.map(([k, v]) => (
              <BreakRow key={k} label={k} value={v} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top origens (utm_source)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topSources.map(([k, v]) => (
              <BreakRow key={k} label={k} value={v} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top referrers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topReferrers.map(([k, v]) => (
              <BreakRow key={k} label={k.length > 50 ? k.slice(0, 50) + "…" : k} value={v} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de sessões */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por lead, UTM, dispositivo, referrer..."
            className="pl-9"
          />
        </div>

        <div className="rounded-md border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Vídeo</TableHead>
                <TableHead>CTAs</TableHead>
                <TableHead>Inscrição</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma sessão encontrada</TableCell></TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setOpenSession(r)}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(r.first_seen_at).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <DeviceIcon d={r.device_type} />
                        <span>{r.device_type ?? "—"}</span>
                        <span className="text-muted-foreground">/ {r.browser ?? "?"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.utm_source ? (
                        <Badge variant="secondary">{r.utm_source}</Badge>
                      ) : r.referrer ? (
                        <span className="text-muted-foreground truncate max-w-[140px] inline-block">{new URL(r.referrer).hostname}</span>
                      ) : (
                        <span className="text-muted-foreground">direto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.video_started ? (
                        <div className="text-xs">
                          <div className="font-medium">{r.video_completion_pct}% / {formatDuration(r.video_watch_seconds)}</div>
                          <div className="text-muted-foreground flex gap-1 items-center">
                            {r.unmuted && <Badge variant="outline" className="h-4 text-[10px] px-1">som</Badge>}
                            {r.went_fullscreen && <Badge variant="outline" className="h-4 text-[10px] px-1">FS</Badge>}
                            {r.max_speed > 1 && <Badge variant="outline" className="h-4 text-[10px] px-1">{r.max_speed}x</Badge>}
                          </div>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">não iniciou</span>}
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.cta_clicks > 0 ? (
                        <div>
                          <div className="font-medium">{r.cta_clicks} cliques</div>
                          <div className="text-muted-foreground">1º: {r.first_cta_clicked ?? "—"}</div>
                        </div>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        {r.signup_completed ? (
                          r.signup_qualified ? (
                            <Badge className="bg-emerald-600 w-fit">Qualificado</Badge>
                          ) : (
                            <Badge variant="secondary" className="w-fit">Inscrito</Badge>
                          )
                        ) : r.signup_modal_opened ? (
                          <Badge variant="outline" className="w-fit">Modal · step {r.signup_step_reached}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        <div className="flex gap-1">
                          {r.reached_thank_you && (
                            <Badge variant="outline" className="h-4 text-[10px] px-1 border-emerald-500 text-emerald-700">obrigado</Badge>
                          )}
                          {r.whatsapp_group_clicked && (
                            <Badge variant="outline" className="h-4 text-[10px] px-1 border-emerald-500 text-emerald-700">WA</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.signup_nome ? (
                        <div>
                          <div className="font-medium truncate max-w-[160px]">{r.signup_nome}</div>
                          <div className="text-muted-foreground truncate max-w-[160px]">{r.signup_email}</div>
                        </div>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setOpenSession(r); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <WebinarSessionDetailDrawer
        session={openSession}
        onClose={() => setOpenSession(null)}
      />
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function FunnelStep({ label, value, base }: { label: string; value: number; base: number }) {
  const pct = base > 0 ? (value / base) * 100 : 0;
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-medium">{value} <span className="text-muted-foreground">({Math.round(pct)}%)</span></span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function BreakRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="truncate">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
