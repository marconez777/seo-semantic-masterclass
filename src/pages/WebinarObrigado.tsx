import SEOHead from "@/components/seo/SEOHead";
import { CheckCircle2, MessageCircle } from "lucide-react";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/PLACEHOLDER";

const WebinarObrigado = () => (
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

        <p className="text-[11px] tracking-[0.2em] uppercase text-webinar-muted mb-4">
          Inscrição confirmada
        </p>

        <h1 className="font-serif-display text-4xl sm:text-5xl leading-[1.1] font-medium tracking-tight mb-6">
          Falta um passo: entre no grupo do WhatsApp.
        </h1>

        <p className="text-[16px] leading-[1.7] text-webinar-muted mb-10">
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

        <p className="text-xs text-webinar-muted mt-8">
          📅 Quinta-feira · 20h · Ao vivo
        </p>
      </div>
    </main>
  </>
);

export default WebinarObrigado;
