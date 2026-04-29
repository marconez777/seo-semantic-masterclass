import { useEffect, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, MessageCircle } from "lucide-react";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/CHs1yNroEsYL6j6LWPQC2N";

const WebinarObrigado = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(80), 250);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <SEOHead
        title="Inscrição confirmada · Webinar Médico | MK"
        description="Sua inscrição foi confirmada. Entre no grupo do WhatsApp para receber o link da aula."
        noindex
      />

      <main className="min-h-screen bg-webinar-cream text-webinar-ink font-sans flex items-center justify-center px-5 py-16">
        <div className="max-w-xl w-full text-center">
          <div className="flex justify-center mb-8">
            <CheckCircle2 size={64} className="text-emerald-600" strokeWidth={1.5} />
          </div>

          <p className="text-[20px] tracking-[0.18em] uppercase text-webinar-muted mb-5">
            Inscrição confirmada
          </p>

          <div className="mx-auto mb-8 w-full max-w-md animate-fade-in">
            <Progress
              value={progress}
              className="h-5 border border-webinar bg-muted shadow-inner [&>div]:!bg-[hsl(var(--webinar-accent))] [&>div]:transition-transform [&>div]:duration-1000 [&>div]:ease-out"
            />
            <p className="mt-4 text-[20px] font-medium text-webinar-muted">
              80% concluído · falta entrar no grupo
            </p>
          </div>

          <h1 className="font-serif-display text-4xl sm:text-5xl leading-[1.1] font-medium tracking-tight mb-6">
            Falta um passo: entre no grupo do WhatsApp.
          </h1>

        <p className="text-[20px] leading-[1.7] text-webinar-muted mb-10">
          O <span className="font-medium text-webinar-ink">link da aula</span> e os lembretes serão enviados <span className="font-medium text-webinar-ink">apenas pelo grupo</span>. Sem o grupo, você corre o risco de perder o webinar.
        </p>

        <a
          href={WHATSAPP_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-webinar-cta w-full sm:w-auto"
        >
          <MessageCircle size={20} />
          Entrar no grupo do WhatsApp
        </a>

        <p className="text-[20px] text-webinar-muted mt-8">
          📅 Domingo, 17/05 · 10h · Ao vivo
        </p>
        </div>
      </main>
    </>
  );
};

export default WebinarObrigado;
