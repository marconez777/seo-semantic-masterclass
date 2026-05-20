import { useEffect, useRef, useState } from "react";
import { Stethoscope, ShieldCheck, Radio, Check, X, Search, Sparkles, MessageCircle, TrendingUp } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { WebinarFooter } from "@/components/webinar/WebinarFooter";
import { WebinarHost } from "@/components/webinar/WebinarHost";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { analytics } from "@/lib/analytics";

// ⚠️ Troque pelo link real do seu grupo do WhatsApp.
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/Eqrg6lc0Lo3GtyYvZbjU7H?mode=gi_t";
const AULA_QUANDO = "Quinta-feira · 20h";
const PROXIMA_DATA = "Próxima quinta · 20h (horário de Brasília)";

type CTASource = "hero" | "learn" | "final" | "sticky";

const trackAndOpen = (source: CTASource) => {
  analytics.track("aula_whatsapp_click", { label: source, data: { source, page: "/aula-medico" } });
  // pequena espera para o flush via keepalive antes de abrir nova aba
  window.open(WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer");
};

// ---------- Hero ----------
const Hero = () => (
  <section className="bg-webinar-cream text-webinar-ink">
    <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24">
      <div className="flex justify-center mb-4">
        <span
          className="inline-block rounded-full border text-[13px] font-medium"
          style={{ borderColor: "#C9A36A", color: "#2D3F50", padding: "6px 14px" }}
        >
          Somente para médicos donos de clínica
        </span>
      </div>

      <p
        className="text-center uppercase font-semibold text-[16px] sm:text-[18px]"
        style={{ color: "#2D3F50", letterSpacing: "0.1em", marginBottom: "24px" }}
      >
        Aula ao vivo gratuita · {AULA_QUANDO}
      </p>

      <h1 className="font-serif-display text-[40px] leading-[1.05] sm:text-6xl md:text-7xl text-center font-medium tracking-tight mb-6">
        Clínica em 1º no Google e nas IAs.
      </h1>

      <p className="text-center text-[20px] leading-[1.6] text-webinar-muted max-w-2xl mx-auto mb-10">
        Como posicionar sua clínica no topo do Google e ser indicada pelo ChatGPT, Gemini e Perplexity —
        sem depender de tráfego pago, sem aparecer em rede social.
      </p>

      <div className="flex flex-col items-center gap-4 mb-10">
        <button onClick={() => trackAndOpen("hero")} className="btn-webinar-cta">
          Entrar no grupo do WhatsApp →
        </button>
        <p className="relative inline-flex items-center gap-2 rounded-md border border-webinar bg-white px-4 py-2 text-[20px] font-bold text-webinar-ink shadow-md">
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-webinar-accent opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-webinar-accent" />
          </span>
          <span>{PROXIMA_DATA}</span>
        </p>
        <p className="text-[16px] text-webinar-muted">O link de acesso à aula é enviado no grupo no dia.</p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
        {[
          { text: "Somente para médicos donos de clínica", Icon: Stethoscope },
          { text: "Dentro da Resolução CFM 2.336/2023", Icon: ShieldCheck },
          { text: "Ao vivo, com espaço para perguntas", Icon: Radio },
        ].map(({ text, Icon }) => (
          <li
            key={text}
            className="flex items-center gap-3 rounded-xl border border-webinar bg-white/70 backdrop-blur-sm px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <Icon size={32} strokeWidth={1.75} className="shrink-0 text-webinar-accent" />
            <span className="text-[15px] sm:text-[16px] leading-snug font-medium text-webinar-ink">
              {text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

// ---------- Learn ----------
const LEARN = [
  { Icon: Search, title: "1º lugar no Google local", text: "A arquitetura de SEO que faz a clínica aparecer acima dos concorrentes para os termos que realmente trazem paciente particular." },
  { Icon: Sparkles, title: "Indicação pelas IAs (GEO)", text: "Como ser citado pelo ChatGPT, Gemini e Perplexity quando o paciente pergunta 'qual a melhor clínica de [especialidade] em [cidade]?'." },
  { Icon: TrendingUp, title: "Aquisição sem tráfego pago", text: "Como construir um ecossistema orgânico previsível que reduz dependência de Ads e CAC mês a mês." },
  { Icon: MessageCircle, title: "WhatsApp que qualifica sozinho", text: "Agente de IA conectado ao WhatsApp que filtra curioso, ancora preço e entrega paciente pronto para a recepção agendar." },
];

const Learn = () => (
  <section className="bg-white text-webinar-ink">
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <h2 className="font-serif-display text-3xl sm:text-5xl font-medium tracking-tight mb-4 max-w-3xl">
        O que você vai aprender na aula.
      </h2>
      <p className="text-[20px] leading-[1.6] text-webinar-muted mb-12 max-w-2xl">
        40 minutos diretos ao ponto. Sem teoria genérica, sem fórmula mágica.
      </p>

      <div className="grid md:grid-cols-2 gap-5">
        {LEARN.map(({ Icon, title, text }) => (
          <div key={title} className="border border-webinar rounded-md p-6 sm:p-7 bg-webinar-cream/40">
            <Icon size={28} className="text-webinar-accent mb-4" strokeWidth={1.75} />
            <h3 className="font-serif-display text-2xl mb-3">{title}</h3>
            <p className="text-[18px] leading-[1.6] text-webinar-muted">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button onClick={() => trackAndOpen("learn")} className="btn-webinar-cta">
          Entrar no grupo do WhatsApp →
        </button>
      </div>
    </div>
  </section>
);

// ---------- For Whom ----------
const SIM = [
  "Você é dono ou sócio de clínica médica de especialidades",
  "Quer diminuir ou substituir o investimento em tráfego pago",
  "Quer aparecer no ChatGPT, Perplexity e Google sem depender de influencer",
  "Busca previsibilidade de caixa com aquisição orgânica",
];
const NAO = [
  "Você é médico recém-formado ainda sem consultório estruturado",
  "Busca fórmula mágica para viralizar no Instagram",
  "Trabalha exclusivamente por convênio e não tem planos de migrar",
];

const ForWhom = () => (
  <section className="bg-webinar-cream text-webinar-ink">
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <h2 className="font-serif-display text-3xl sm:text-5xl font-medium tracking-tight mb-12 max-w-2xl">
        Essa aula não é para todo mundo.
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white border border-webinar rounded-md p-6 sm:p-8">
          <h3 className="font-serif-display text-2xl mb-6">É para você se:</h3>
          <ul className="space-y-4">
            {SIM.map((t) => (
              <li key={t} className="flex items-start gap-3 text-[20px] leading-[1.6]">
                <Check size={20} className="mt-0.5 shrink-0 text-emerald-600" strokeWidth={2.5} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-webinar rounded-md p-6 sm:p-8">
          <h3 className="font-serif-display text-2xl mb-6 text-webinar-muted">NÃO é para você se:</h3>
          <ul className="space-y-4">
            {NAO.map((t) => (
              <li key={t} className="flex items-start gap-3 text-[20px] leading-[1.6] text-webinar-muted">
                <X size={20} className="mt-0.5 shrink-0" strokeWidth={2.5} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

// ---------- FAQ ----------
const FAQS = [
  { q: "A aula é realmente gratuita?", a: "Sim. 100% gratuita e ao vivo. Você entra no grupo do WhatsApp e recebe o link de acesso no dia da aula." },
  { q: "Como recebo o link da aula?", a: "Ao entrar no grupo do WhatsApp, você recebe lembretes e o link de acesso é enviado no grupo poucos minutos antes do início." },
  { q: "Vai ter gravação?", a: "A aula é ao vivo. Quem está no grupo no momento da transmissão tem prioridade total para perguntas e materiais de apoio. Avisamos no grupo se a gravação ficará disponível." },
  { q: "Preciso instalar alguma coisa?", a: "Não. Basta entrar no grupo do WhatsApp. O link da aula abre direto no navegador, no celular ou no computador." },
  { q: "Funciona para a minha especialidade?", a: "Funciona para qualquer especialidade médica com demanda particular: psiquiatria, ortopedia, dermatologia, ginecologia, gastro, endocrino, cardio e outras. Na aula adaptamos os exemplos para diferentes nichos." },
];

const FAQ = () => (
  <section className="bg-white text-webinar-ink">
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <h2 className="font-serif-display text-3xl sm:text-5xl font-medium tracking-tight mb-10">
        Perguntas frequentes.
      </h2>
      <Accordion type="single" collapsible className="border-t border-webinar">
        {FAQS.map(({ q, a }, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-b border-webinar">
            <AccordionTrigger className="text-left font-sans font-semibold text-[20px] py-5 hover:no-underline">
              {q}
            </AccordionTrigger>
            <AccordionContent className="text-[20px] leading-[1.7] text-webinar-muted pb-6">
              {a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

// ---------- Final CTA ----------
const FinalCTA = () => (
  <section className="bg-webinar-navy text-webinar-ink-inverse">
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
      <h2 className="font-serif-display text-4xl sm:text-6xl leading-[1.05] font-medium tracking-tight mb-8">
        Entre no grupo e receba o link da aula.
      </h2>
      <p className="text-[20px] leading-[1.7] text-webinar-muted-inverse mb-12 max-w-2xl mx-auto">
        Toda quinta às 20h, ao vivo. A vaga é garantida pra quem está no grupo do WhatsApp no momento da transmissão.
      </p>
      <div className="space-y-2 text-[20px] text-webinar-muted-inverse mb-12">
        <p>📅 {AULA_QUANDO}</p>
        <p>⏰ Duração estimada: 40 minutos</p>
        <p>💻 Online, ao vivo, com perguntas e respostas</p>
      </div>
      <button onClick={() => trackAndOpen("final")} className="btn-webinar-cta">
        Entrar no grupo do WhatsApp →
      </button>
      <p className="mt-4 text-[20px] text-webinar-muted-inverse">
        Gratuita. Somente para médicos donos de clínica.
      </p>
    </div>
  </section>
);

// ---------- Sticky CTA ----------
const StickyCTA = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(docH > 0 && window.scrollY / docH > 0.4);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => trackAndOpen("sticky")}
      className="fixed bottom-0 left-0 right-0 z-40 bg-webinar-accent text-webinar-navy font-semibold py-4 px-5 text-center text-[20px] shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.3)] hover:brightness-95 transition"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      AULA GRÁTIS · {AULA_QUANDO.toUpperCase()} · ENTRAR NO GRUPO →
    </button>
  );
};

// ---------- Page ----------
const AulaMedico = () => {
  const startRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);

  useEffect(() => {
    analytics.track("aula_view", { label: "aula-medico", data: { page: "/aula-medico" } });
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH <= 0) return;
      const pct = Math.min(100, Math.round((window.scrollY / docH) * 100));
      if (pct >= 75 && maxScrollRef.current < 75) {
        analytics.track("aula_scroll_75", { label: "aula-medico" });
      }
      if (pct > maxScrollRef.current) maxScrollRef.current = pct;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      const secs = Math.round((Date.now() - startRef.current) / 1000);
      analytics.track("aula_exit", { label: "aula-medico", data: { time_on_page_seconds: secs, max_scroll_pct: maxScrollRef.current } });
    };
  }, []);

  return (
    <>
      <SEOHead
        title="Aula Grátis para Médicos · Clínica em 1º no Google e nas IAs | MK"
        description="Aula ao vivo gratuita toda quinta às 20h. Como posicionar sua clínica em 1º no Google e ser indicada por ChatGPT, Gemini e Perplexity — sem tráfego pago."
        canonicalUrl="https://mkart.com.br/aula-medico"
      />
      <main className="font-sans text-[20px]">
        <Hero />
        <Learn />
        <ForWhom />
        <WebinarHost />
        <FAQ />
        <FinalCTA />
        <WebinarFooter />
      </main>
      <StickyCTA />
    </>
  );
};

export default AulaMedico;
