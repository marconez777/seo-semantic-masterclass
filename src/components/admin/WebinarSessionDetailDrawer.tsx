import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface SessionLite {
  id: string;
  session_id: string;
  signup_nome?: string | null;
  signup_email?: string | null;
  [key: string]: any;
}

interface EventRow {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

const formatDuration = (s: number) => {
  if (!s) return "0s";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  return `${m}m ${sec}s`;
};

const eventLabel: Record<string, string> = {
  page_view: "📄 Página visualizada",
  video_overlay_start: "▶️ Clicou para começar (overlay)",
  video_play: "▶️ Play no vídeo",
  video_pause: "⏸️ Pausou",
  video_unmute: "🔊 Ativou som",
  video_fullscreen: "⛶ Tela cheia",
  video_speed_change: "⏩ Mudou velocidade",
  video_seek_blocked: "⛔ Tentou avançar",
  video_ended: "🏁 Vídeo terminou",
  video_progress_25: "📊 25% do vídeo",
  video_progress_50: "📊 50% do vídeo",
  video_progress_75: "📊 75% do vídeo",
  video_progress_95: "📊 95% do vídeo",
  cta_click: "🟡 Clicou CTA",
  signup_open: "📝 Abriu inscrição",
  signup_step: "📝 Avançou step",
  signup_submit: "✅ Submeteu inscrição",
  signup_qualified: "🎯 Qualificado",
  signup_unqualified: "🚫 Não qualificado",
  signup_error: "❌ Erro inscrição",
  thank_you_view: "🙏 Página de obrigado",
  whatsapp_group_click: "💬 Clicou no grupo WhatsApp",
};

export function WebinarSessionDetailDrawer({
  session,
  onClose,
}: {
  session: SessionLite | null;
  onClose: () => void;
}) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("webinar_events" as any)
        .select("*")
        .eq("session_id", session.session_id)
        .order("created_at", { ascending: true })
        .limit(500);
      setEvents((data ?? []) as any);
      setLoading(false);
    };
    load();
  }, [session]);

  if (!session) return null;

  const Field = ({ label, value }: { label: string; value: any }) => (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium break-words">
        {value === null || value === undefined || value === "" ? "—" : String(value)}
      </div>
    </div>
  );

  return (
    <Sheet open={!!session} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes da sessão</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Identificação */}
          <section>
            <h3 className="font-semibold mb-3">Identificação</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Session ID" value={session.session_id} />
              <Field label="Primeira visita" value={new Date(session.first_seen_at).toLocaleString("pt-BR")} />
              <Field label="Última atividade" value={new Date(session.last_seen_at).toLocaleString("pt-BR")} />
              <Field label="Tempo na página" value={formatDuration(session.total_time_on_page_seconds)} />
              <Field label="Scroll" value={`${session.scroll_depth_pct}%`} />
              {session.signup_nome && (
                <>
                  <Field label="Lead — Nome" value={session.signup_nome} />
                  <Field label="Lead — Email" value={session.signup_email} />
                </>
              )}
            </div>
          </section>

          {/* Origem */}
          <section>
            <h3 className="font-semibold mb-3">Origem</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="UTM source" value={session.utm_source} />
              <Field label="UTM medium" value={session.utm_medium} />
              <Field label="UTM campaign" value={session.utm_campaign} />
              <Field label="UTM content" value={session.utm_content} />
              <Field label="UTM term" value={session.utm_term} />
              <Field label="Referrer" value={session.referrer} />
              <div className="col-span-2">
                <Field label="Landing URL" value={session.landing_url} />
              </div>
            </div>
          </section>

          {/* Dispositivo */}
          <section>
            <h3 className="font-semibold mb-3">Dispositivo</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo" value={session.device_type} />
              <Field label="OS" value={session.os} />
              <Field label="Navegador" value={session.browser} />
              <Field label="País" value={session.ip_country} />
              <Field label="Tela" value={session.screen_size} />
              <Field label="Viewport" value={session.viewport_size} />
              <Field label="Idioma" value={session.language} />
              <Field label="Fuso" value={session.timezone} />
              <div className="col-span-2">
                <Field label="User agent" value={session.user_agent} />
              </div>
            </div>
          </section>

          {/* Vídeo */}
          <section>
            <h3 className="font-semibold mb-3">Comportamento no vídeo</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Iniciou" value={session.video_started ? "Sim" : "Não"} />
              <Field label="Completou" value={session.video_completed ? "Sim" : "Não"} />
              <Field label="Tempo assistido" value={formatDuration(session.video_watch_seconds)} />
              <Field label="Posição máxima" value={formatDuration(session.video_max_position_seconds)} />
              <Field label="% completou" value={`${session.video_completion_pct}%`} />
              <Field label="Duração total" value={formatDuration(session.video_duration_seconds)} />
              <Field label="Ativou som" value={session.unmuted ? "Sim" : "Não"} />
              <Field label="Tela cheia" value={session.went_fullscreen ? "Sim" : "Não"} />
              <Field label="Velocidade máx" value={`${session.max_speed}x`} />
            </div>
          </section>

          {/* CTAs */}
          <section>
            <h3 className="font-semibold mb-3">Cliques em CTA</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Total" value={session.cta_clicks} />
              <Field label="1º CTA clicado" value={session.first_cta_clicked} />
              <Field label="Hero" value={session.cta_hero_clicks} />
              <Field label="Learn" value={session.cta_learn_clicks} />
              <Field label="Final" value={session.cta_final_clicks} />
              <Field label="Sticky" value={session.cta_sticky_clicks} />
            </div>
          </section>

          {/* Inscrição */}
          <section>
            <h3 className="font-semibold mb-3">Inscrição</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Abriu modal" value={session.signup_modal_opened ? "Sim" : "Não"} />
              <Field label="Step máximo" value={session.signup_step_reached} />
              <Field label="Completou" value={session.signup_completed ? "Sim" : "Não"} />
              <Field label="Qualificado" value={session.signup_qualified ? "Sim" : "Não"} />
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h3 className="font-semibold mb-3">Timeline de eventos</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
            ) : (
              <ol className="space-y-2 border-l-2 border-muted pl-4">
                {events.map((e) => (
                  <li key={e.id} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.created_at).toLocaleTimeString("pt-BR")}
                    </div>
                    <div className="text-sm font-medium">
                      {eventLabel[e.event_type] ?? e.event_type}
                    </div>
                    {e.event_data && Object.keys(e.event_data).length > 0 && (
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        {Object.entries(e.event_data)
                          .map(([k, v]) => `${k}: ${typeof v === "number" ? Math.round(v * 100) / 100 : v}`)
                          .join(" · ")}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
