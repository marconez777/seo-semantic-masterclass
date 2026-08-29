import { useNavigate } from "react-router-dom";
import {
  Check,
  Clock,
  Infinity as InfinityIcon,
  MessageCircle,
  Pencil,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BACKLINK_PACKAGES,
  brl,
  brlCompact,
  packageCheckoutPath,
  packageWhatsAppUrl,
  type BacklinkPackage,
} from "@/lib/packages";

/**
 * Comprimento do arco de meia-lua abaixo (raio 32) — usado para posicionar a
 * faixa de DA na escala de 0 a 100 via stroke-dasharray.
 */
const ARC_LENGTH = Math.PI * 32;
const ARC_PATH = "M 8 44 A 32 32 0 0 1 72 44";

/**
 * Medidor da faixa de DA: o arco mostra onde o pacote cai entre 0 e 100.
 *
 * O texto vive em HTML sobreposto, e nao dentro do <svg>: texto de SVG nao
 * quebra linha nem respeita o viewBox, entao rotulo mais longo que a largura
 * do arco (o caso do pacote Personalizado) era cortado no meio.
 */
function DaGauge({ pkg }: { pkg: BacklinkPackage }) {
  const hasRange = pkg.daMin !== null && pkg.daMax !== null;
  const before = hasRange ? (ARC_LENGTH * (pkg.daMin as number)) / 100 : 0;
  const band = hasRange
    ? (ARC_LENGTH * ((pkg.daMax as number) - (pkg.daMin as number))) / 100
    : 0;

  return (
    <div className="relative mx-auto w-[128px]">
      <svg
        viewBox="0 0 80 48"
        className="block w-full"
        role="img"
        aria-label={
          hasRange
            ? `Faixa de DA de ${pkg.daMin} a ${pkg.daMax}, numa escala de 0 a 100`
            : "Quantidade e faixa de DA definidas por você"
        }
      >
        <path
          d={ARC_PATH}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={hasRange ? undefined : "3 6"}
        />
        {hasRange && (
          <>
            <path
              d={ARC_PATH}
              fill="none"
              stroke="hsl(var(--primary) / 0.25)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${before} ${ARC_LENGTH}`}
            />
            <path
              d={ARC_PATH}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${band} ${ARC_LENGTH}`}
              strokeDashoffset={-before}
            />
          </>
        )}
      </svg>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        {hasRange ? (
          <span className="text-xl font-bold leading-none">
            {pkg.daMin}–{pkg.daMax}
          </span>
        ) : (
          <SlidersHorizontal className="size-5 text-foreground" aria-hidden="true" />
        )}
        <span className="mt-1 text-[10px] uppercase leading-none tracking-wide text-muted-foreground">
          {hasRange ? "DA" : "Quantidade e DA"}
        </span>
      </div>
    </div>
  );
}

function PackageCard({ pkg }: { pkg: BacklinkPackage }) {
  const navigate = useNavigate();
  const isCustom = pkg.ctaType === "whatsapp";
  const anchorPrice = pkg.anchorServicePrice;
  const anchorsIncluded = anchorPrice === 0;

  const priceNote =
    pkg.priceNote ??
    (pkg.price !== null && pkg.quantity
      ? `${brl(pkg.price / pkg.quantity)} por link`
      : undefined);

  const handleClick = () => {
    try {
      import("@/lib/analytics").then(({ analytics }) =>
        analytics.track("click_pacote", {
          label: pkg.slug,
          data: { price: pkg.price },
        })
      );
    } catch {
      // analytics nao pode quebrar a navegacao
    }

    if (isCustom) {
      window.open(packageWhatsAppUrl(pkg), "_blank");
      return;
    }
    navigate(packageCheckoutPath(pkg));
  };

  return (
    <div
      className={`flex flex-col rounded-lg bg-card p-5 transition-shadow hover:shadow-md ${
        pkg.highlight ? "border-2 border-primary" : "border border-border"
      }`}
    >
      <p
        className={`text-center text-xs font-medium mb-1 ${
          pkg.highlight ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {pkg.name}
        {pkg.badge && ` · ${pkg.badge.toLowerCase()}`}
      </p>

      <DaGauge pkg={pkg} />

      <div className="text-center mt-2 mb-4">
        <p className="text-base font-medium">
          {isCustom ? "Do seu jeito" : `${pkg.quantity} backlinks`}
        </p>
        <p className="text-2xl font-bold leading-tight">
          {pkg.price !== null ? brlCompact(pkg.price) : "Sob consulta"}
        </p>
        {priceNote && <p className="text-xs text-muted-foreground">{priceNote}</p>}
      </div>

      <ul className="flex-1 border-t border-border pt-4 space-y-1.5 mb-4">
        <li className="flex items-start gap-2 text-xs text-muted-foreground">
          <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{isCustom ? "Prazo a combinar" : `Entrega em ${pkg.deliveryLabel}`}</span>
        </li>

        {isCustom ? (
          <li className="flex items-start gap-2 text-xs text-muted-foreground">
            <Target className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{pkg.detailNote}</span>
          </li>
        ) : (
          <li
            className={`flex items-start gap-2 text-xs ${
              anchorsIncluded ? "text-secondary font-medium" : "text-muted-foreground"
            }`}
          >
            {anchorsIncluded ? (
              <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <Pencil className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>
              {anchorsIncluded
                ? "Âncoras inclusas"
                : `Âncoras pela MK + ${brlCompact(anchorPrice ?? 0)}`}
            </span>
          </li>
        )}

        <li className="flex items-start gap-2 text-xs text-muted-foreground">
          <InfinityIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>Links permanentes</span>
        </li>
      </ul>

      <Button
        onClick={handleClick}
        variant={pkg.highlight || isCustom ? "default" : "outline"}
        className="w-full gap-2"
      >
        {isCustom && <MessageCircle className="size-4" aria-hidden="true" />}
        {pkg.ctaLabel}
      </Button>
    </div>
  );
}

export default function PackageCards() {
  return (
    <section className="mb-10" aria-labelledby="pacotes-heading">
      <div className="mb-4">
        <h2 id="pacotes-heading" className="text-2xl font-bold">
          Pacotes prontos de backlinks
        </h2>
        <p className="text-sm text-muted-foreground">
          Contrate um volume fechado com entrega rápida — ou escolha site a site na
          lista abaixo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BACKLINK_PACKAGES.map((pkg) => (
          <PackageCard key={pkg.slug} pkg={pkg} />
        ))}
      </div>
    </section>
  );
}
