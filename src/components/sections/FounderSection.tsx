import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube } from "lucide-react";

/**
 * Numa home de agência de backlinks o fundador é sinal de E-E-A-T, não a história
 * da empresa: quem é, desde quando, quantos clientes. A biografia longa saiu —
 * o comprador desta categoria checa se existe gente real por trás, e para na
 * primeira frase que responde isso.
 */
const FounderSection = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">
                Quem assina o trabalho
              </h2>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Comecei no SEO em 2016, depois de anos criando sites como web
                  designer. Desde então venho testando e validando o que funciona
                  a cada atualização do Google.
                </p>
                <p>
                  Hoje somos uma equipe que prospecta portais de autoridade todos
                  os dias, com mais de 1.000 clientes atendidos.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button asChild variant="outline" size="icon" className="rounded-full size-11">
                  <a
                    href="https://www.instagram.com/seosupremo777/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram da MK Art"
                  >
                    <Instagram className="size-5" aria-hidden="true" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="icon" className="rounded-full size-11">
                  <a
                    href="https://www.youtube.com/@mkartseolinkbuilding614"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube da MK Art"
                  >
                    <Youtube className="size-5" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>

            <div>
              <Card className="relative overflow-hidden border-border">
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted relative">
                    <img
                      src="/lovable-uploads/b120631c-0792-4f41-8951-878c83dd310f.png"
                      alt="Marco Guimarães, fundador da MK Art"
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground p-5">
                      <h3 className="text-xl font-bold">Marco Guimarães</h3>
                      <p className="text-sm opacity-90">Fundador da MK Art</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
