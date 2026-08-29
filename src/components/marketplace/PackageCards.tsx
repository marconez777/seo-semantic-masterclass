import { useNavigate } from "react-router-dom";
import { Check, Clock, Zap, Star, Settings2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BACKLINK_PACKAGES,
  brl,
  packageCheckoutPath,
  packageWhatsAppUrl,
  type BacklinkPackage,
} from "@/lib/packages";

const icons: Record<string, typeof Zap> = {
  basico: Zap,
  medio: Star,
  personalizado: Settings2,
};

function PackageCard({ pkg }: { pkg: BacklinkPackage }) {
  const navigate = useNavigate();
  const Icon = icons[pkg.slug] ?? Zap;
  const isCustom = pkg.ctaType === "whatsapp";

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
      className={`relative flex flex-col rounded-lg border bg-card p-5 transition-shadow hover:shadow-md ${
        pkg.highlight ? "border-2 border-primary" : "border-border"
      }`}
    >
      {pkg.badge && (
        <span className="absolute -top-3 left-5 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          {pkg.badge}
        </span>
      )}

      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-muted-foreground">{pkg.name}</span>
      </div>

      {isCustom ? (
        <>
          <p className="text-xl font-bold">Do seu jeito</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Volume e faixa de DA a combinar
          </p>
          <p className="mt-4 text-2xl font-bold text-muted-foreground">Sob consulta</p>
        </>
      ) : (
        <>
          <p className="text-xl font-bold">{pkg.quantity} backlinks</p>
          <p className="mt-1 text-sm text-muted-foreground">
            DA {pkg.daMin} – {pkg.daMax}
          </p>
          <p className="mt-4 text-3xl font-bold text-primary">{brl(pkg.price ?? 0)}</p>
          <p className="text-xs text-muted-foreground">pagamento único, à vista no PIX</p>
        </>
      )}

      <ul className="mt-4 flex-1 space-y-2 text-sm">
        <li className="flex items-start gap-2 text-muted-foreground">
          <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>Entrega em {pkg.deliveryLabel}</span>
        </li>
        {!isCustom && (
          <li className="flex items-start gap-2">
            <Check
              className={`mt-0.5 size-4 shrink-0 ${
                pkg.anchorServicePrice === 0 ? "text-secondary" : "text-muted-foreground"
              }`}
              aria-hidden="true"
            />
            <span className={pkg.anchorServicePrice === 0 ? "text-secondary font-medium" : "text-muted-foreground"}>
              {pkg.anchorServicePrice === 0
                ? "Âncoras escolhidas pela MK inclusas"
                : `Âncoras escolhidas pela MK por + ${brl(pkg.anchorServicePrice ?? 0)}`}
            </span>
          </li>
        )}
      </ul>

      <Button
        onClick={handleClick}
        variant={pkg.highlight ? "default" : "outline"}
        className="mt-5 w-full gap-2"
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {BACKLINK_PACKAGES.map((pkg) => (
          <PackageCard key={pkg.slug} pkg={pkg} />
        ))}
      </div>
    </section>
  );
}
