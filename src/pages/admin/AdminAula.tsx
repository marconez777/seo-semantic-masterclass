import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Smartphone, Monitor, Tablet, Download, RefreshCw, Trash2, MousePointerClick } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PAGE_PATH = "/aula-medico";
const CLICK_EVENT = "aula_whatsapp_click";

type Period = "7" | "30" | "all";

interface SessionRow {
  session_id: string;
  first_seen_at: string;
  device_type: string | null;
  os: string | null;
  browser: string | null;
  ip_country: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  time_on_page: number;
  scroll_pct: number;
  clicks: number;
  hero: number;
  learn: number;
  final: number;
  sticky: number;
  first_source: string | null;
}

const DeviceIcon = ({ d }: { d: string | null }) => {
  if (d === "mobile") return <Smartphone className="w-4 h-4" />;
  if (d === "tablet") return <Tablet className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
};

const fmtTime = (s: number) => {
  if (!s) return "0s";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m ? `${m}m ${sec}s` : `${sec}s`;
};

export default function AdminAula() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [period, setPeriod] = useState<Period>("30");
  const [q, setQ] = useState("");
  const [device, setDevice] = useState<string>("all");
  const [onlyClicked, setOnlyClicked] = useState(false);

  const load = async () => {
    setLoading(true);
    const since = period === "all" ? null : new Date(Date.now() - Number(period) * 86400000).toISOString();

    // 1. Pageviews em /aula-medico (define o universo de sessões)
    let pvQuery = supabase
      .from("analytics_pageviews")
      .select("session_id, duration_seconds, scroll_depth_pct, created_at")
      .eq("path", PAGE_PATH)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (since) pvQuery = pvQuery.gte("created_at", since);

    // 2. Cliques no WhatsApp
    let evQuery = supabase
      .from("analytics_events")
      .select("session_id, event_label, created_at")
      .eq("event_type", CLICK_EVENT)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (since) evQuery = evQuery.gte("created_at", since);

    const [{ data: pvs, error: pvErr }, { data: evs, error: evErr }] = await Promise.all([pvQuery, evQuery]);
    if (pvErr || evErr) {
      toast({ title: "Erro ao carregar", description: pvErr?.message || evErr?.message });
      setLoading(false);
      return;
    }

    const sessionIds = Array.from(new Set([...(pvs ?? []).map((p) => p.session_id), ...(evs ?? []).map((e) => e.session_id)]));
    if (sessionIds.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    // 3. Dados das sessões
    const { data: sessions, error: sErr } = await supabase
      .from("analytics_sessions")
      .select("session_id, started_at, device_type, os, browser, ip_country, utm_source, utm_medium, utm_campaign, referrer")
      .in("session_id", sessionIds);
    if (sErr) {
      toast({ title: "Erro ao carregar sessões", description: sErr.message });
      setLoading(false);
      return;
    }

    // Agregar
    const pvBySession = new Map<string, { time: number; scroll: number }>();
    for (const pv of pvs ?? []) {
      const acc = pvBySession.get(pv.session_id) ?? { time: 0, scroll: 0 };
      acc.time += pv.duration_seconds ?? 0;
      acc.scroll = Math.max(acc.scroll, pv.scroll_depth_pct ?? 0);
      pvBySession.set(pv.session_id, acc);
    }

    const evBySession = new Map<string, { clicks: number; hero: number; learn: number; final: number; sticky: number; first: string | null; firstAt: number }>();
    for (const ev of evs ?? []) {
      const acc = evBySession.get(ev.session_id) ?? { clicks: 0, hero: 0, learn: 0, final: 0, sticky: 0, first: null, firstAt: Infinity };
      acc.clicks += 1;
      const lbl = (ev.event_label ?? "").toLowerCase();
      if (lbl === "hero") acc.hero += 1;
      else if (lbl === "learn") acc.learn += 1;
      else if (lbl === "final") acc.final += 1;
      else if (lbl === "sticky") acc.sticky += 1;
      const t = new Date(ev.created_at).getTime();
      if (t < acc.firstAt) { acc.firstAt = t; acc.first = lbl || null; }
      evBySession.set(ev.session_id, acc);
    }

    const merged: SessionRow[] = (sessions ?? []).map((s) => {
      const pv = pvBySession.get(s.session_id) ?? { time: 0, scroll: 0 };
      const ev = evBySession.get(s.session_id) ?? { clicks: 0, hero: 0, learn: 0, final: 0, sticky: 0, first: null, firstAt: 0 };
      return {
        session_id: s.session_id,
        first_seen_at: s.started_at,
        device_type: s.device_type,
        os: s.os,
        browser: s.browser,
        ip_country: s.ip_country,
        utm_source: s.utm_source,
        utm_medium: s.utm_medium,
        utm_campaign: s.utm_campaign,
        referrer: s.referrer,
        time_on_page: pv.time,
        scroll_pct: pv.scroll,
        clicks: ev.clicks,
        hero: ev.hero,
        learn: ev.learn,
        final: ev.final,
        sticky: ev.sticky,
        first_source: ev.first,
      };
    }).sort((a, b) => new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime());

    setRows(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, [period]);

  const filtered = useMemo(() => rows.filter((r) => {
    if (onlyClicked && r.clicks === 0) return false;
    if (device !== "all" && r.device_type !== device) return false;
    if (q.trim()) {
      const t = q.toLowerCase();
      const hay = [r.session_id, r.utm_source, r.utm_medium, r.utm_campaign, r.referrer, r.ip_country].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(t)) return false;
    }
    return true;
  }), [rows, q, device, onlyClicked]);

  const kpis = useMemo(() => {
    const sessions = filtered.length;
    const clicked = filtered.filter((r) => r.clicks > 0).length;
    const totalClicks = filtered.reduce((a, r) => a + r.clicks, 0);
    const rate = sessions > 0 ? (clicked / sessions) * 100 : 0;
    return {
      sessions,
      clicked,
      totalClicks,
      rate,
      hero: filtered.reduce((a, r) => a + r.hero, 0),
      learn: filtered.reduce((a, r) => a + r.learn, 0),
      final: filtered.reduce((a, r) => a + r.final, 0),
      sticky: filtered.reduce((a, r) => a + r.sticky, 0),
    };
  }, [filtered]);

  const handleDelete = async (session_id: string) => {
    if (!confirm("Excluir esta sessão e seus eventos?")) return;
    await Promise.all([
      supabase.from("analytics_events").delete().eq("session_id", session_id),
      supabase.from("analytics_pageviews").delete().eq("session_id", session_id),
      supabase.from("analytics_sessions").delete().eq("session_id", session_id),
    ]);
    setRows((prev) => prev.filter((r) => r.session_id !== session_id));
    toast({ title: "Sessão excluída" });
  };

  const exportCSV = () => {
    const header = ["Data", "Session", "Device", "OS", "Browser", "País", "UTM Source", "UTM Medium", "UTM Campaign", "Referrer", "Tempo (s)", "Scroll %", "Cliques", "Hero", "Aprender", "Final", "Sticky", "Primeira fonte"];
    const lines = filtered.map((r) => [
      new Date(r.first_seen_at).toLocaleString("pt-BR"),
      r.session_id, r.device_type ?? "", r.os ?? "", r.browser ?? "", r.ip_country ?? "",
      r.utm_source ?? "", r.utm_medium ?? "", r.utm_campaign ?? "", r.referrer ?? "",
      r.time_on_page, r.scroll_pct, r.clicks, r.hero, r.learn, r.final, r.sticky, r.first_source ?? "",
    ]);
    const csv = [header, ...lines].map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aula-medico-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Aula Médico</h1>
        <p className="text-sm text-muted-foreground">Rastreio de cliques no botão de WhatsApp da página /aula-medico</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Sessões</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{kpis.sessions}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Sessões com clique</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{kpis.clicked}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Taxa de clique</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{kpis.rate.toFixed(1)}%</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cliques totais</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold flex items-center gap-2"><MousePointerClick className="w-6 h-6 text-primary" />{kpis.totalClicks}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Hero", v: kpis.hero },
          { label: "Aprender", v: kpis.learn },
          { label: "Final", v: kpis.final },
          { label: "Sticky", v: kpis.sticky },
        ].map((c) => (
          <Card key={c.label}><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</p><p className="text-2xl font-bold mt-1">{c.v}</p></CardContent></Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="all">Todo o período</SelectItem>
          </SelectContent>
        </Select>

        <Select value={device} onValueChange={setDevice}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Dispositivo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos dispositivos</SelectItem>
            <SelectItem value="desktop">Desktop</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="tablet">Tablet</SelectItem>
          </SelectContent>
        </Select>

        <Button variant={onlyClicked ? "default" : "outline"} onClick={() => setOnlyClicked((v) => !v)}>
          Só quem clicou
        </Button>

        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por session, UTM, referrer..." className="pl-9" />
        </div>

        <div className="ml-auto flex gap-2">
          <Button onClick={load} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
          <Button onClick={exportCSV} variant="outline" disabled={!filtered.length}>
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>OS / Browser</TableHead>
              <TableHead>País</TableHead>
              <TableHead>UTM</TableHead>
              <TableHead>Referrer</TableHead>
              <TableHead className="text-right">Tempo</TableHead>
              <TableHead className="text-right">Scroll</TableHead>
              <TableHead className="text-right">Cliques</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">Nenhuma sessão encontrada</TableCell></TableRow>
            ) : filtered.map((r) => (
              <TableRow key={r.session_id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{new Date(r.first_seen_at).toLocaleString("pt-BR")}</TableCell>
                <TableCell><div className="flex items-center gap-2"><DeviceIcon d={r.device_type} /><span className="text-sm capitalize">{r.device_type ?? "-"}</span></div></TableCell>
                <TableCell className="text-sm">{r.os ?? "-"} / {r.browser ?? "-"}</TableCell>
                <TableCell className="text-sm">{r.ip_country ?? "-"}</TableCell>
                <TableCell className="text-sm">{r.utm_source ? `${r.utm_source}${r.utm_medium ? "/" + r.utm_medium : ""}` : <span className="text-muted-foreground">-</span>}</TableCell>
                <TableCell className="text-sm max-w-[200px] truncate" title={r.referrer ?? ""}>{r.referrer ?? <span className="text-muted-foreground">direto</span>}</TableCell>
                <TableCell className="text-right text-sm">{fmtTime(r.time_on_page)}</TableCell>
                <TableCell className="text-right text-sm">{r.scroll_pct}%</TableCell>
                <TableCell className="text-right font-medium">
                  {r.clicks > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                      <span>{r.clicks}</span>
                      {r.first_source && <Badge variant="secondary" className="capitalize">{r.first_source}</Badge>}
                    </div>
                  ) : <span className="text-muted-foreground">0</span>}
                </TableCell>
                <TableCell>
                  {r.clicks > 0 ? (
                    <Badge className="bg-green-600 hover:bg-green-700">Clicou</Badge>
                  ) : (
                    <Badge variant="outline">Não clicou</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(r.session_id)} aria-label="Excluir">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
