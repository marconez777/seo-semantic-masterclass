import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Store, Boxes, Repeat } from "lucide-react";
import { CHECKOUT_PACKAGES, WHATSAPP_NUMBER, brlCompact } from "@/lib/packages";
import { useCatalogStats } from "@/hooks/useCatalogStats";

/**
 * Modalidades de compra.
 *
 * A ordem dos cards é uma progressão real: **quanto a MK faz por você**. No
 * catálogo o cliente escolhe cada portal; no pacote ele define o volume e a MK
 * escolhe os sites; no mensal a MK escolhe tudo e mantém a cadência. Ordenar por
 * grau de delegação diz algo verdadeiro sobre o produto; ordenar por preço, não.
 *
 * Substitui a antiga `ServicesSection`, que contrapunha consultoria e loja.
 */

/**
 * Preço e volume do plano mensal.
 *
 * <important>
 * Enquanto `monthlyLinks` ou `monthlyFrom` forem null, o card mostra "sob
 * consulta". Isso é **temporário e indesejado**, porque esconder preço é o
 * comportamento da concorrência que a home inteira ataca. Preencher assim que a
 * operação definir os três valores.
 * </important>
 */
const MONTHLY_PLAN: {
  links: number | null;
  daMin: number | null;
  daMax: number | null;
  priceFrom: number | null;
} = {
  links: null,
  daMin: null,
  daMax: null,
  priceFrom: null,
};

const entryPackage = CHECKOUT_PACKAGES[0];
const packageDaMin = Math.min(...CHECKOUT_PACKAGES.map((p) => p.daMin ?? 0));
const packageDaMax = Math.max(...CHECKOUT_PACKAGES.map((p) => p.daMax ?? 0));

const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá! Quero saber mais sobre o plano mensal de backlinks."
)}`;

const PurchaseOptionsSection = () => {
  const { data: stats } = useCatalogStats();

  const monthlySpecs = [
    MONTHLY_PLAN.links ? `${MONTHLY_PLAN.links} backlinks por mês` : "Volume mensal fixo",
    MONTHLY_PLAN.daMin && MONTHLY_PLAN.daMax
      ? `DA ${MONTHLY_PLAN.daMin} a ${MONTHLY_PLAN.daMax}`
      : "Faixa de DA definida no plano",
    "Estratégia de âncoras feita pela MK",
    "Relatório mensal com a URL de cada link",
  ];

  const options = [
    {
      slug: "catalogo",
      name: "Catálogo",
      eyebrow: "Avulso",
      icon: Store,
      pitch: "Você já sabe em quais portais quer aparecer.",
      description:
        "Escolhe site por site, vê DA, tráfego e preço antes de decidir, e paga só o que colocar no carrinho.",
      price: stats?.total
        ? `${stats.total.toLocaleString("pt-BR")} portais`
        : "Catálogo completo",
      priceNote: "preço por publicação, na tela",
      specs: [
        "Você escolhe cada portal",
        `DA de 1 a ${stats?.maxDa ?? 95}`,
        "Você define o texto-âncora",
        "7 a 15 dias úteis",
      ],
      ctaLabel: "Ver o catálogo",
      to: "/comprar-backlinks",
      external: false,
      highlight: false,
    },
    {
      slug: "pacotes",
      name: "Pacotes",
      eyebrow: "Volume fechado",
      icon: Boxes,
      pitch: "Você quer volume e prefere não escolher site por site.",
      description:
        "Volume fechado por preço fixo. A MK seleciona os portais dentro da faixa de autoridade do pacote, e não exige cadastro.",
      price: entryPackage ? `a partir de ${brlCompact(entryPackage.price ?? 0)}` : "",
      priceNote: entryPackage ? `${entryPackage.quantity} backlinks` : "",
      specs: [
        "A MK escolhe os portais",
        `DA de ${packageDaMin} a ${packageDaMax}`,
        "Âncoras suas ou feitas pela MK",
        "1 a 3 dias úteis",
      ],
      ctaLabel: "Ver os pacotes",
      to: "/comprar-backlinks#pacotes",
      external: false,
      highlight: false,
    },
    {
      slug: "mensal",
      name: "Mensal",
      eyebrow: "Gerenciado",
      icon: Repeat,
      pitch: "Você quer um perfil de links crescendo todo mês, sem gerenciar nada.",
      description:
        "A MK define a estratégia de âncoras, seleciona os portais e publica um volume fixo por mês, com relatório de cada publicação.",
      price: MONTHLY_PLAN.priceFrom
        ? `a partir de ${brlCompact(MONTHLY_PLAN.priceFrom)}/mês`
        : "sob consulta",
      priceNote: "publicação contínua",
      specs: monthlySpecs,
      ctaLabel: "Falar com especialista",
      to: whatsappHref,
      external: true,
      highlight: true,
    },
  ];

  return (
    <section id="modalidades" className="py-16 md:py-20 bg-muted/40 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-center">
            Modalidades de compra
          </h2>
          <p className="mt-3 text-muted-foreground text-center max-w-2xl mx-auto">
            Três formas de comprar, da que você controla inteira até a que a
            gente conduz do começo ao fim.
          </p>

          <div className="mt-12 grid md:grid-cols-3 gap-6 items-start">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.slug}
                  className={`relative flex h-full flex-col rounded-xl border bg-card p-6 ${
                    option.highlight
                      ? "border-primary shadow-lg shadow-primary/10 md:-mt-2"
                      : "border-border"
                  }`}
                >
                  {option.highlight && (
                    <Badge className="absolute -top-3 left-6">
                      A MK faz por você
                    </Badge>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground leading-none">
                        {option.eyebrow}
                      </span>
                      <h3 className="text-xl font-bold text-foreground leading-none mt-1">
                        {option.name}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-5 font-medium text-foreground leading-snug">
                    {option.pitch}
                  </p>

                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>

                  <div className="mt-6 border-t border-border pt-5">
                    <div className="text-2xl font-bold text-foreground tabular-nums">
                      {option.price}
                    </div>
                    {option.priceNote && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {option.priceNote}
                      </div>
                    )}
                  </div>

                  <ul className="mt-5 space-y-3 flex-1">
                    {option.specs.map((spec) => (
                      <li key={spec} className="flex items-start gap-3">
                        <Check
                          className="size-4 text-secondary mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-muted-foreground">{spec}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className="mt-7 w-full"
                    variant={option.highlight ? "default" : "outline"}
                  >
                    {option.external ? (
                      <a href={option.to} target="_blank" rel="noopener noreferrer">
                        {option.ctaLabel}
                      </a>
                    ) : (
                      <Link to={option.to}>{option.ctaLabel}</Link>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PurchaseOptionsSection;
