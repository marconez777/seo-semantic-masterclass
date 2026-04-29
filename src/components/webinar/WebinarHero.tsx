import { Check } from "lucide-react";
import { LockedVideoPlayer } from "./LockedVideoPlayer";

interface Props {
  onCTAClick: () => void;
  videoUrl: string;
  posterUrl?: string;
  vagas: string;
}

export const WebinarHero = ({ onCTAClick, videoUrl, posterUrl, vagas }: Props) => (
  <section className="bg-webinar-cream text-webinar-ink">
    <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24">
      <p className="text-[20px] tracking-[0.16em] uppercase text-webinar-muted text-center mb-8">
        Webinar ao vivo · Domingo, 17/05 · 10h · Somente para PSIQUIATRAS donos de clínica
      </p>

      <h1 className="font-serif-display text-[40px] leading-[1.05] sm:text-6xl md:text-7xl text-center font-medium tracking-tight mb-6">
        A clínica indicada pelo ChatGPT que recebe 15 a 20 leads qualificados por dia, sem tráfego pago.
      </h1>



      <div className="w-full max-w-3xl mx-auto mb-10">
        <LockedVideoPlayer src={videoUrl} poster={posterUrl} />
      </div>

      <div className="flex flex-col items-center gap-4 mb-10">
        <button onClick={onCTAClick} className="btn-webinar-cta">
          Garantir minha vaga gratuita →
        </button>
        <p className="relative inline-flex items-center gap-2 rounded-md border border-webinar bg-white px-4 py-2 text-[20px] font-bold text-webinar-ink shadow-md">
          <span className="relative flex size-3">
            <span className="relative inline-flex size-3 rounded-full bg-webinar-accent" />
          </span>
           <span><span className="text-webinar-accent">{vagas}</span> vagas</span>
        </p>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 max-w-5xl mx-auto">
        {[
          "Somente para psiquiatras",
          "Dentro da Resolução CFM 2.336/2023",
          "Método aplicado em dezenas de clínicas",
          "Ao vivo, com espaço para perguntas",
          "Sem promessa milagrosa",
        ].map((t) => (
          <li
            key={t}
            className="flex items-start gap-3 rounded-xl border border-webinar bg-white/70 backdrop-blur-sm px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="mt-0.5 shrink-0 inline-flex items-center justify-center size-6 rounded-full bg-webinar-accent/15 ring-1 ring-webinar-accent/30">
              <Check size={14} strokeWidth={3} className="text-webinar-accent" />
            </span>
            <span className="text-[15px] sm:text-[16px] leading-snug font-medium text-webinar-ink">
              {t}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
