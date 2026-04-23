interface Props { videoId: string; }

export const WebinarCaseIvan = ({ videoId }: Props) => (
  <section className="bg-webinar-navy text-webinar-ink-inverse">
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <p className="text-[20px] tracking-[0.16em] uppercase text-webinar-muted-inverse mb-6">
        Caso de estudo · Psiquiatria
      </p>
      <h2 className="font-serif-display text-3xl sm:text-5xl leading-[1.1] font-medium tracking-tight max-w-3xl mb-12">
        Como o Dr. Ivan substituiu 100% do tráfego pago por SEO, GEO e IA.
      </h2>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        <div className="aspect-video bg-black/40 rounded-md overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Depoimento Dr. Ivan"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        <div className="space-y-5 text-[20px] leading-[1.7] text-webinar-muted-inverse">
          <p>
            Antes, a clínica do Dr. Ivan dependia de anúncios pagos no Google e Meta. O resultado era previsível: muito volume de WhatsApp, baixa qualificação, recepção sobrecarregada respondendo curioso e pouca conversão em consulta particular.
          </p>
          <p>Depois da implementação do Ecossistema de Aquisição Clínica, três coisas mudaram:</p>
          <ul className="space-y-2 pl-4 border-l-2 border-webinar-accent/60">
            <li><span className="text-webinar-ink-inverse font-medium">Ranqueamento orgânico</span> para palavras de fundo de funil — pacientes prontos para agendar.</li>
            <li><span className="text-webinar-ink-inverse font-medium">Recomendação pelo ChatGPT e Perplexity</span> quando o paciente pergunta pelo melhor especialista da região.</li>
            <li><span className="text-webinar-ink-inverse font-medium">Agente de IA no WhatsApp</span> qualificando leads 24/7 e ancorando preço antes da recepção.</li>
          </ul>
          <p className="text-webinar-ink-inverse">
            Resultado: 15 a 20 leads qualificados por dia, sem depender mais de anúncios.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-12 border-t border-webinar-inverse">
        {[
          { n: "15-20", l: "leads qualificados / dia" },
          { n: "100%", l: "substituição de tráfego pago" },
          { n: "24/7", l: "atendimento por IA" },
        ].map(({ n, l }) => (
          <div key={n} className="text-center sm:text-left">
            <div className="font-serif-display text-5xl sm:text-6xl text-webinar-accent leading-none">{n}</div>
            <div className="mt-2 text-[20px] text-webinar-muted-inverse">{l}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
