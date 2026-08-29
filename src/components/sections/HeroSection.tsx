import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCatalogStats } from "@/hooks/useCatalogStats";

/**
 * Os três números ficam dentro do hero, não numa seção abaixo: prova junto da
 * promessa converte melhor do que prova depois dela. Enquanto carregam, mostram
 * um traço — nunca um valor chutado.
 */
const HeroStat = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">
      {value}
    </span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

const HeroSection = () => {
  const { data: stats, isLoading } = useCatalogStats();

  const show = (n: number | undefined) =>
    isLoading || n == null ? "—" : n.toLocaleString("pt-BR");

  return (
    <section id="home" className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.05] tracking-tight text-balance">
            Comprar backlinks de qualidade em{" "}
            <span className="text-primary">portais brasileiros reais</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Você vê o site, o DA e o tráfego antes de pagar. Publicação
            editorial, link dofollow e relatório com a URL de cada publicação.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="text-base">
              <Link to="/comprar-backlinks">
                Ver os portais e preços
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <a href="#auditoria">Auditoria gratuita de backlinks</a>
            </Button>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl">
          <HeroStat value={show(stats?.total)} label="portais no catálogo" />
          <HeroStat value={show(stats?.avgDa)} label="DA médio" />
          <HeroStat value={show(stats?.maxDa)} label="DA máximo" />
          <HeroStat value="30" label="dias de garantia" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
