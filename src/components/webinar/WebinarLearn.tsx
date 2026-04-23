import { Search, Filter, Bot, TrendingDown } from "lucide-react";

const ITEMS = [
  { icon: Search, title: "Como aparecer no Google e no ChatGPT", desc: "O método de SEO de fundo de funil + GEO que faz a sua clínica ser recomendada pelas IAs quando o paciente pergunta pelo melhor especialista." },
  { icon: Filter, title: "Como filtrar o convênio-dependente antes do WhatsApp", desc: "A estrutura de funil que ancora preço no anúncio e entrega para a sua recepção apenas paciente particular pronto para agendar." },
  { icon: Bot, title: "Como montar o agente de IA que qualifica 24/7", desc: "O setup exato que o Dr. Ivan usa para responder, qualificar, ancorar preço e agendar sem depender da secretária." },
  { icon: TrendingDown, title: "Como sair da dependência de Ads sem perder volume", desc: "A transição gradual do tráfego pago para o orgânico + GEO, sem colapsar a agenda no meio do caminho." },
];

interface Props { onCTAClick: () => void; vagas: string; }

export const WebinarLearn = ({ onCTAClick, vagas }: Props) => (
  <section className="bg-webinar-cream text-webinar-ink">
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <h2 className="font-serif-display text-3xl sm:text-5xl leading-[1.1] font-medium tracking-tight max-w-3xl mb-12">
        Na quinta-feira, 20h, ao vivo, você vai ver:
      </h2>

      <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
        {ITEMS.map(({ icon: Icon, title, desc }, i) => (
          <article key={title} className="bg-white border border-webinar rounded-md p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="font-serif-display text-3xl text-webinar-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Icon size={22} className="text-webinar-muted" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif-display text-xl sm:text-2xl leading-snug mb-3">{title}</h3>
            <p className="text-[15px] leading-[1.65] text-webinar-muted">{desc}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 mt-14">
        <button onClick={onCTAClick} className="btn-webinar-cta">Quero garantir minha vaga →</button>
        <p className="text-[11px] text-webinar-muted">{vagas} vagas</p>
      </div>
    </div>
  </section>
);
