import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Eye, Users, MousePointerClick, MessageCircle, ShoppingBag, TrendingUp } from "lucide-react";

type Period = "7" | "30" | "90";

const CHANNEL_COLORS: Record<string, string> = {
  organic: "#10b981",
  direct: "#6366f1",
  paid: "#f59e0b",
  social: "#ec4899",
  referral: "#0ea5e9",
  email: "#8b5cf6",
  unknown: "#94a3b8",
};

function sinceISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<Period>("30");
  const since = useMemo(() => sinceISO(parseInt(period, 10)), [period]);

  const [kpi, setKpi] = useState({ visitors: 0, sessions: 0, pageviews: 0, signups: 0, wa: 0, orders: 0 });
  const [byDay, setByDay] = useState<Array<{ date: string; sessions: number }>>([]);
  const [byChannel, setByChannel] = useState<Array<{ name: string; value: number }>>([]);
  const [topPages, setTopPages] = useState<Array<{ path: string; views: number }>>([]);
  const [topSignupPages, setTopSignupPages] = useState<Array<{ path: string; count: number }>>([]);
  const [topWaPages, setTopWaPages] = useState<Array<{ path: string; count: number }>>([]);
  const [topReferrers, setTopReferrers] = useState<Array<{ host: string; sessions: number; signups: number }>>([]);
  const [topUtms, setTopUtms] = useState<Array<{ source: string; medium: string; campaign: string; sessions: number }>>([]);
  const [topOrganicLandings, setTopOrganicLandings] = useState<Array<{ path: string; sessions: number }>>([]);
  const [recentLeads, setRecentLeads] = useState<Array<{ user_id: string; name: string; email: string; created_at: string }>>([]);
  const [realtime, setRealtime] = useState<Array<{ session_id: string; path: string; channel: string | null; last_seen_at: string }>>([]);
  const [timelineLead, setTimelineLead] = useState<{ user_id: string; name: string } | null>(null);
  const [timeline, setTimeline] = useState<Array<{ ts: string; type: string; label: string; path: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    async function load() {
      setLoading(true);
      try {
        // Sessions in period (full select para agregações no client; volume é baixo)
        const { data: sessions } = await supabase
          .from("analytics_sessions")
          .select("session_id, visitor_id, started_at, channel, signed_up, clicked_whatsapp, created_order, referrer_host, utm_source, utm_medium, utm_campaign, landing_path")
          .gte("started_at", since)
          .order("started_at", { ascending: false })
          .limit(10000);

        const ses = sessions ?? [];
        const visitors = new Set(ses.map((s) => s.visitor_id)).size;
        const signups = ses.filter((s) => s.signed_up).length;
        const wa = ses.filter((s) => s.clicked_whatsapp).length;
        const orders = ses.filter((s) => s.created_order).length;

        // Pageviews count
        const { count: pvCount } = await supabase
          .from("analytics_pageviews")
          .select("*", { count: "exact", head: true })
          .gte("created_at", since);

        if (cancelled) return;
        setKpi({ visitors, sessions: ses.length, pageviews: pvCount ?? 0, signups, wa, orders });

        // Sessions per day
        const dayMap: Record<string, number> = {};
        ses.forEach((s) => {
          const d = (s.started_at || "").slice(0, 10);
          dayMap[d] = (dayMap[d] || 0) + 1;
        });
        const days = Object.entries(dayMap).sort((a, b) => a[0].localeCompare(b[0])).map(([date, sessions]) => ({ date, sessions }));
        setByDay(days);

        // Channel pie
        const channelMap: Record<string, number> = {};
        ses.forEach((s) => {
          const c = s.channel || "unknown";
          channelMap[c] = (channelMap[c] || 0) + 1;
        });
        setByChannel(Object.entries(channelMap).map(([name, value]) => ({ name, value })));

        // Top pages
        const { data: pvs } = await supabase
          .from("analytics_pageviews")
          .select("path")
          .gte("created_at", since)
          .limit(20000);
        const pageMap: Record<string, number> = {};
        (pvs ?? []).forEach((p) => { pageMap[p.path] = (pageMap[p.path] || 0) + 1; });
        setTopPages(Object.entries(pageMap).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([path, views]) => ({ path, views })));

        // Pages that produced signups / wa clicks
        const { data: convEvents } = await supabase
          .from("analytics_events")
          .select("event_type, path")
          .gte("created_at", since)
          .in("event_type", ["signup_completed", "click_whatsapp"])
          .limit(20000);
        const sMap: Record<string, number> = {};
        const wMap: Record<string, number> = {};
        (convEvents ?? []).forEach((e) => {
          if (!e.path) return;
          if (e.event_type === "signup_completed") sMap[e.path] = (sMap[e.path] || 0) + 1;
          if (e.event_type === "click_whatsapp") wMap[e.path] = (wMap[e.path] || 0) + 1;
        });
        setTopSignupPages(Object.entries(sMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, count]) => ({ path, count })));
        setTopWaPages(Object.entries(wMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, count]) => ({ path, count })));

        // Top referrers
        const refMap: Record<string, { sessions: number; signups: number }> = {};
        ses.forEach((s) => {
          const h = s.referrer_host || "(direto)";
          if (!refMap[h]) refMap[h] = { sessions: 0, signups: 0 };
          refMap[h].sessions++;
          if (s.signed_up) refMap[h].signups++;
        });
        setTopReferrers(Object.entries(refMap).sort((a, b) => b[1].sessions - a[1].sessions).slice(0, 15).map(([host, v]) => ({ host, ...v })));

        // UTMs
        const utmMap: Record<string, number> = {};
        ses.forEach((s) => {
          if (!s.utm_source && !s.utm_campaign) return;
          const k = `${s.utm_source || "-"}|${s.utm_medium || "-"}|${s.utm_campaign || "-"}`;
          utmMap[k] = (utmMap[k] || 0) + 1;
        });
        setTopUtms(Object.entries(utmMap).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, sessions]) => {
          const [source, medium, campaign] = k.split("|");
          return { source, medium, campaign, sessions };
        }));

        // Top organic landings
        const orgMap: Record<string, number> = {};
        ses.filter((s) => s.channel === "organic").forEach((s) => {
          const p = s.landing_path || "/";
          orgMap[p] = (orgMap[p] || 0) + 1;
        });
        setTopOrganicLandings(Object.entries(orgMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, sessions]) => ({ path, sessions })));

        // Recent leads
        const { data: leads } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, created_at")
          .order("created_at", { ascending: false })
          .limit(20);
        setRecentLeads((leads ?? []).map((l) => ({ user_id: l.user_id!, name: l.full_name || "—", email: l.email || "—", created_at: l.created_at! })));

        // Realtime: sessions with last_seen in last 5 min
        const fiveMin = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data: rt } = await supabase
          .from("analytics_sessions")
          .select("session_id, exit_path, landing_path, channel, last_seen_at")
          .gte("last_seen_at", fiveMin)
          .order("last_seen_at", { ascending: false })
          .limit(50);
        setRealtime((rt ?? []).map((r) => ({
          session_id: r.session_id,
          path: r.exit_path || r.landing_path || "/",
          channel: r.channel,
          last_seen_at: r.last_seen_at,
        })));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const t = setInterval(load, 60000);
    return () => { cancelled = true; ctrl.abort(); clearInterval(t); };
  }, [since]);

  async function openTimeline(lead: { user_id: string; name: string }) {
    setTimelineLead(lead);
    setTimeline([]);
    const [{ data: pvs }, { data: evs }] = await Promise.all([
      supabase.from("analytics_pageviews").select("path, created_at").eq("user_id", lead.user_id).order("created_at", { ascending: false }).limit(200),
      supabase.from("analytics_events").select("event_type, event_label, path, created_at").eq("user_id", lead.user_id).order("created_at", { ascending: false }).limit(200),
    ]);
    const items: Array<{ ts: string; type: string; label: string; path: string | null }> = [];
    (pvs ?? []).forEach((p) => items.push({ ts: p.created_at!, type: "pageview", label: "Visualizou página", path: p.path }));
    (evs ?? []).forEach((e) => items.push({ ts: e.created_at!, type: e.event_type, label: e.event_label || e.event_type, path: e.path }));
    items.sort((a, b) => b.ts.localeCompare(a.ts));
    setTimeline(items);
  }

  const conversionRate = kpi.sessions > 0 ? ((kpi.signups / kpi.sessions) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Rastreamento próprio (first-party). Nenhum dado é compartilhado com terceiros.</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard icon={<Users className="w-4 h-4" />} label="Visitantes" value={kpi.visitors} />
        <KpiCard icon={<Eye className="w-4 h-4" />} label="Sessões" value={kpi.sessions} />
        <KpiCard icon={<MousePointerClick className="w-4 h-4" />} label="Pageviews" value={kpi.pageviews} />
        <KpiCard icon={<TrendingUp className="w-4 h-4" />} label="Cadastros" value={kpi.signups} sub={`${conversionRate}% conv.`} />
        <KpiCard icon={<MessageCircle className="w-4 h-4" />} label="Cliques WhatsApp" value={kpi.wa} />
        <KpiCard icon={<ShoppingBag className="w-4 h-4" />} label="Pedidos" value={kpi.orders} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
          <TabsTrigger value="sources">Origens</TabsTrigger>
          <TabsTrigger value="leads">Leads (timeline)</TabsTrigger>
          <TabsTrigger value="realtime">Tempo real</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Sessões por dia</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={byDay}>
                    <XAxis dataKey="date" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Por canal</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byChannel} dataKey="value" nameKey="name" outerRadius={80} label>
                      {byChannel.map((c, i) => <Cell key={i} fill={CHANNEL_COLORS[c.name] || "#94a3b8"} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <PathTable title="Páginas mais visitadas" rows={topPages.map((r) => ({ path: r.path, val: r.views }))} valueLabel="Views" />
            <PathTable title="Páginas que mais geram cadastros" rows={topSignupPages.map((r) => ({ path: r.path, val: r.count }))} valueLabel="Cadastros" />
            <PathTable title="Páginas com mais cliques no WhatsApp" rows={topWaPages.map((r) => ({ path: r.path, val: r.count }))} valueLabel="Cliques" />
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Top referrers</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Origem</TableHead><TableHead className="text-right">Sessões</TableHead><TableHead className="text-right">Cadastros</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {topReferrers.map((r) => (
                      <TableRow key={r.host}><TableCell className="font-mono text-xs">{r.host}</TableCell><TableCell className="text-right">{r.sessions}</TableCell><TableCell className="text-right">{r.signups}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Campanhas (UTM)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Source</TableHead><TableHead>Medium</TableHead><TableHead>Campaign</TableHead><TableHead className="text-right">Sessões</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {topUtms.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-sm py-6">Nenhuma campanha registrada no período.</TableCell></TableRow>}
                    {topUtms.map((u, i) => (
                      <TableRow key={i}><TableCell className="text-xs">{u.source}</TableCell><TableCell className="text-xs">{u.medium}</TableCell><TableCell className="text-xs">{u.campaign}</TableCell><TableCell className="text-right">{u.sessions}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <PathTable title="Landings de tráfego orgânico" rows={topOrganicLandings.map((r) => ({ path: r.path, val: r.sessions }))} valueLabel="Sessões" />
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader><CardTitle className="text-base">Leads recentes</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Cadastro</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {recentLeads.map((l) => (
                    <TableRow key={l.user_id}>
                      <TableCell>{l.name}</TableCell>
                      <TableCell className="text-xs">{l.email}</TableCell>
                      <TableCell className="text-xs">{new Date(l.created_at).toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => openTimeline({ user_id: l.user_id, name: l.name })}>Ver jornada</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime">
          <Card>
            <CardHeader><CardTitle className="text-base">Sessões ativas (últimos 5 min)</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-3">{realtime.length} <span className="text-sm font-normal text-muted-foreground">visitantes online</span></p>
              <Table>
                <TableHeader><TableRow><TableHead>Página</TableHead><TableHead>Canal</TableHead><TableHead className="text-right">Última atividade</TableHead></TableRow></TableHeader>
                <TableBody>
                  {realtime.map((r) => (
                    <TableRow key={r.session_id}>
                      <TableCell className="font-mono text-xs">{r.path}</TableCell>
                      <TableCell><Badge variant="outline" style={{ borderColor: CHANNEL_COLORS[r.channel || "unknown"] }}>{r.channel || "—"}</Badge></TableCell>
                      <TableCell className="text-right text-xs">{new Date(r.last_seen_at).toLocaleTimeString("pt-BR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!timelineLead} onOpenChange={(o) => !o && setTimelineLead(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Jornada de {timelineLead?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {timeline.length === 0 && <p className="text-sm text-muted-foreground">Sem atividade rastreada para este lead.</p>}
            {timeline.map((t, i) => (
              <div key={i} className="flex items-start gap-3 border-l-2 border-primary/40 pl-3 py-1">
                <div className="text-xs text-muted-foreground w-32 shrink-0">{new Date(t.ts).toLocaleString("pt-BR")}</div>
                <div className="flex-1">
                  <Badge variant="secondary" className="text-[10px] mr-2">{t.type}</Badge>
                  <span className="text-sm">{t.label}</span>
                  {t.path && <div className="text-xs text-muted-foreground font-mono">{t.path}</div>}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KpiCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">{icon}{label}</div>
        <div className="text-2xl font-bold">{value.toLocaleString("pt-BR")}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function PathTable({ title, rows, valueLabel }: { title: string; rows: Array<{ path: string; val: number }>; valueLabel: string }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Página</TableHead><TableHead className="text-right">{valueLabel}</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground text-sm py-6">Sem dados</TableCell></TableRow>}
            {rows.map((r) => (
              <TableRow key={r.path}><TableCell className="font-mono text-xs truncate max-w-[260px]">{r.path}</TableCell><TableCell className="text-right">{r.val}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
