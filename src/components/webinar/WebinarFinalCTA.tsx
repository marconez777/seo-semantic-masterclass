interface Props { onCTAClick: () => void; }

export const WebinarFinalCTA = ({ onCTAClick }: Props) => (
  <section className="bg-webinar-navy text-webinar-ink-inverse">
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
      <h2 className="font-serif-display text-4xl sm:text-6xl leading-[1.05] font-medium tracking-tight mb-8">
        Na quinta-feira, 20h, você decide.
      </h2>

      <p className="text-[20px] leading-[1.7] text-webinar-muted-inverse mb-12 max-w-2xl mx-auto">
        Continuar queimando caixa em anúncio pago e dependendo da sua presença física para faturar, ou implementar a mesma arquitetura de aquisição que tirou o Dr. Ivan da dependência de Ads e colocou a clínica dele em 1º lugar no Google e no ChatGPT.
      </p>

      <div className="space-y-2 text-[20px] text-webinar-muted-inverse mb-12">
        <p>📅 Quinta-feira</p>
        <p>⏰ 20h — duração de 90 minutos</p>
        <p>💻 Online, ao vivo, com espaço para perguntas</p>
      </div>

      <button onClick={onCTAClick} className="btn-webinar-cta">
        Garantir minha vaga gratuita →
      </button>
      <p className="mt-4 text-[20px] text-webinar-muted-inverse">
        Evento gratuito. Vaga limitada. Somente para donos de clínica.
      </p>
    </div>
  </section>
);
