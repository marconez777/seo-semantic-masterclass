import { Search, FileCheck2, Newspaper, ClipboardList } from "lucide-react";

/**
 * Quatro passos, não seis. O passo 2 é o que carrega o peso: a objeção mais
 * comum de quem compra backlink é não saber o que está comprando até o dinheiro
 * já ter saído. A aprovação prévia precisa estar visível, não no contrato.
 *
 * Não confundir com `DeliveryProcessSection`, que descreve o processo da
 * consultoria de SEO e sai do ar junto com `/consultoria-seo`.
 */
const steps = [
  {
    title: "Você escolhe o portal",
    description:
      "No catálogo aberto, com DA, tráfego, categoria e preço na tela. Ou deixa a escolha com a gente, no pacote e no plano mensal.",
    icon: Search,
  },
  {
    title: "Aprova a pauta e a âncora",
    description:
      "Antes de qualquer publicação. Você vê o tema do artigo e o texto-âncora que vai apontar para o seu site, e pode mudar os dois.",
    icon: FileCheck2,
  },
  {
    title: "Publicamos como conteúdo editorial",
    description:
      "Artigo único, escrito para o portal, com link dofollow. Nada de PBN, link farm ou site sem tráfego real.",
    icon: Newspaper,
  },
  {
    title: "Você recebe a URL de cada link",
    description:
      "Relatório com o endereço de cada publicação, para conferir uma por uma. Sem relatório, você não tem como saber o que comprou.",
    icon: ClipboardList,
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-center">
            Como funciona
          </h2>
          <p className="mt-3 text-muted-foreground text-center max-w-2xl mx-auto">
            Quatro etapas, e você aprova antes da terceira.
          </p>

          <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="relative rounded-xl border border-border bg-card p-6 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                      {index + 1} de {steps.length}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
