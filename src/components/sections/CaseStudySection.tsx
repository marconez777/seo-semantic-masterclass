
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";

// Dados dos depoimentos
const testimonials = [
  {
    client: "Dr. Gabriel",
    videoUrl: "https://www.youtube.com/embed/OWWQfH-V1Iw",
    headline: "Mais de 100 Mil Visitas no Site",
    description: "O cliente atingiu 100k de visitas mensais e sua recepcionista chegou até a reclamar de não estar dando conta de tantos atendimentos.",
    metrics: [{ value: "137", label: "Backlinks" }, { value: "115.803", label: "Tráfego Mensal" }],
    keywords: ["1° como saber se eu tenho tdah", "1° como descobrir se eu tenho tdah", "2° teste depressão bipolar", "2° teste rapido tdah"],
  },
  {
    client: "kronoos",
    videoUrl: "https://www.youtube.com/embed/B35Poq_3xDM",
    headline: "O Sistema que foi para 1º Página em 3 meses",
    description: "Em 3 meses, o Sistema Kronoos alcançou a 1ª página do Google com uma estratégia focada e assertiva.",
    metrics: [{ value: "88", label: "Backlinks" }, { value: "12.500", label: "Tráfego Mensal" }],
    keywords: [
      "1° ferramenta de background check",
      "1° compliance criminal",
      "1° compliance ambiental",
      "1° compliance bancário",
      "2° software compliance",
    ],
  },
  {
    client: "Soluções em Embalagens",
    videoUrl: "https://www.youtube.com/embed/iX7ShYZVxgo",
    headline: "A Loja Soluções em Embalagens foi de R$ 25 Mil a R$ 70 Mil em 3 Meses de SEO.",
    description: "Em apenas 3 meses conseguimos aumentar o faturamento da loja online do cliente Paulo de R$ 25 Mil para R$ 70 Mil reais.",
    metrics: [{ value: "35", label: "Backlinks" }, { value: "50.230", label: "Tráfego Mensal" }],
    keywords: [
      "1° comprar sacolas plásticas direto da fábrica",
      "1° fornecedor de sacolas",
      "2° comprar sacolas plásticas personalizadas",
      "2° comprar sacolas personalizadas plásticas",
    ],
  }
];

const CaseStudySection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-20">
          {testimonials.map((testimonial, index) => (
            <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={`space-y-8 ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight text-balance">
                    {(() => {
                      const { headline, client } = testimonial;
                      const i = headline.indexOf(client);
                      if (i >= 0) {
                        const before = headline.slice(0, i);
                        const after = headline.slice(i + client.length);
                        return (
                          <>
                            {before}
                            <span className="text-primary">
                              {client}
                            </span>
                            {after}
                          </>
                        );
                      }
                      return (
                        <>
                          {headline}{" "}
                          <span className="text-primary">
                            do {client}
                          </span>
                        </>
                      );
                    })()}
                  </h2>
                  
                  <p className="text-lg text-muted-foreground mb-8">
                    {testimonial.description}
                  </p>
                </div>
                
                <div className="space-y-4">
                  {testimonial.keywords.map((keyword, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-secondary shrink-0" aria-hidden="true" />
                      <span className="text-muted-foreground">{keyword}</span>
                    </div>
                  ))}
                </div>
                
                {/* Backlinks -> tráfego, com a seta: numa agência de backlinks a
                    leitura é de causa para efeito, não duas métricas soltas. */}
                <div className="flex items-center gap-6 pt-8">
                  {testimonial.metrics.map((metric, i) => (
                    <div key={i} className="flex items-center gap-6">
                      {i > 0 && (
                        <ArrowRight className="w-6 h-6 text-primary shrink-0" aria-hidden="true" />
                      )}
                      <div>
                        <div className="text-4xl font-bold text-foreground tabular-nums">{metric.value}</div>
                        <div className="text-muted-foreground text-sm">{metric.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <a href="#auditoria">
                  <Button size="lg" className="text-base">
                    Quero uma auditoria como essa
                  </Button>
                </a>
              </div>
              
              <div className={`${index % 2 !== 0 ? 'lg:order-1' : ''}`}>
                <Card className="border-0 shadow-2xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full"
                        src={testimonial.videoUrl}
                        title={`Depoimento do ${testimonial.client}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudySection;
