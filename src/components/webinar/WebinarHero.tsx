import { Stethoscope, ShieldCheck, Radio } from "lucide-react";
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

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
        {[
          { text: "Somente para psiquiatras", Icon: Stethoscope },
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
