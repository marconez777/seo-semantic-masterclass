export const WebinarHost = () => (
  <section className="bg-webinar-navy text-webinar-ink-inverse">
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <p className="text-[20px] tracking-[0.16em] uppercase text-webinar-muted-inverse mb-6">
        Quem conduz
      </p>

      <div className="grid lg:grid-cols-[300px_1fr] gap-10 lg:gap-16 items-start">
        <div className="aspect-[4/5] bg-webinar-border-inverse/40 rounded-md overflow-hidden flex items-center justify-center">
          <span className="font-serif-display text-7xl text-webinar-accent">MK</span>
        </div>

        <div>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-medium tracking-tight mb-8">
            Marco Guimarães — MK
          </h2>

          <div className="space-y-5 text-[20px] leading-[1.7] text-webinar-muted-inverse max-w-2xl">
            <p>
              Especialista em aquisição orgânica para clínicas médicas, com foco em SEO de performance, GEO (otimização para IAs generativas) e integração com agentes de IA para WhatsApp.
            </p>
            <p>
              Trabalha dentro da Resolução CFM 2.336/2023 e do manual atualizado de publicidade médica, construindo ecossistemas de aquisição que fortalecem o CNPJ da clínica — não o CPF de médicos individuais.
            </p>
            <p>
              Já implementou o método em clínicas de psiquiatria, gastroenterologia, psicologia e muitas outras especialidades. Os resultados vão desde ranqueamento em primeiro lugar no Google e recomendação pelo ChatGPT até redução de mais de 70% no investimento em tráfego pago.
            </p>
            <p className="text-webinar-ink-inverse">
              Não faz dancinha. Não promete viralização. Entrega dashboard com CAC, ROI e origem de cada paciente que se senta na cadeira.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
