import { ShieldCheck } from "lucide-react";

/**
 * O argumento mais forte da MK, e o único que nenhum concorrente brasileiro tem:
 * os outros prometem **reposição** (você ganha outro link), a MK devolve
 * **dinheiro**.
 *
 * A recusa de prometer prazo de indexação é parte da venda, não uma ressalva —
 * concorrente que promete "indexação em 30 dias" está prometendo o que não
 * controla. Por isso ela fica em destaque, e nunca em letra miúda.
 */
const GuaranteeSection = () => {
  return (
    <section className="py-16 md:py-20 bg-secondary/5 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Garantia de 30 dias
          </span>

          <h2 className="mt-5 text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">
            Não deu certo? Devolvemos o dinheiro e removemos os links.
          </h2>

          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Você tem 30 dias. Sem justificativa, sem processo e sem crédito para
            usar depois — o dinheiro de volta.
          </p>

          <div className="mt-8 rounded-xl border border-border bg-card p-6 text-left">
            <h3 className="text-base font-semibold text-foreground">
              O que a gente não promete: prazo de indexação
            </h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Quem decide quando indexar é o Google, e agência que promete o que
              não controla está prometendo o que não pode cumprir. O que está na
              nossa mão é produzir o conteúdo de um jeito que indexa mais rápido
              — e é por isso que a nossa garantia é de devolução, não de prazo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuaranteeSection;
