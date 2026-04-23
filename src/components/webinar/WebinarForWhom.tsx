import { Check, X } from "lucide-react";

const SIM = [
  "Você é dono ou sócio de clínica médica de especialidades",
  "Quer diminuir ou substituir o investimento em tráfego pago",
  "Quer que a marca da clínica (CNPJ) seja mais forte que o nome dos médicos (CPF)",
  "Busca previsibilidade de caixa com aquisição orgânica",
  "Quer aparecer no ChatGPT, Perplexity e Google sem depender de influencer",
];

const NAO = [
  "Você é médico recém-formado ainda sem consultório estruturado",
  "Busca fórmula mágica para viralizar no Instagram",
  "Não está disposto a implementar processos de rastreio e CRM",
  "Trabalha exclusivamente por convênio e não tem planos de migrar",
];

export const WebinarForWhom = () => (
  <section className="bg-webinar-cream text-webinar-ink">
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <h2 className="font-serif-display text-3xl sm:text-5xl font-medium tracking-tight mb-12 max-w-2xl">
        Esse webinar não é para todo mundo.
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white border border-webinar rounded-md p-6 sm:p-8">
          <h3 className="font-serif-display text-2xl mb-6">É para você se:</h3>
          <ul className="space-y-4">
            {SIM.map((t) => (
              <li key={t} className="flex items-start gap-3 text-[15px] leading-[1.6]">
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
              <li key={t} className="flex items-start gap-3 text-[15px] leading-[1.6] text-webinar-muted">
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
