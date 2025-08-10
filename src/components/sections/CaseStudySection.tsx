
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

// Dados dos depoimentos
const testimonials = [
  {
    client: "Dr. Gabriel",
    videoUrl: "https://www.youtube.com/embed/OWWQfH-V1Iw",
    headline: "Mais de 100 Mil Visitas no Site",
    description: "O cliente atingiu 100k de visitas mensais e sua recepcionista chegou até a reclamar de não estar dando conta de tantos atendimentos.",
    metrics: [{ value: "137", label: "Backlinks" }, { value: "115.803", label: "Tráfego Mensal" }],
    keywords: ["Psiquiatra tdah", "Teste diagnóstico tdah", "Como descobrir tdah teste", "Como saber se eu tenho tdah teste"],
  },
  {
    client: "Sistema Kronoos",
    videoUrl: "https://www.youtube.com/embed/B35Poq_3xDM",
    headline: "O Sistema que foi para 1º Página em 3 meses",
    description: "Em 3 meses, o Sistema Kronoos alcançou a 1ª página do Google com uma estratégia focada e assertiva.",
    metrics: [{ value: "88", label: "Backlinks" }, { value: "7.563", label: "Tráfego Mensal" }],
    keywords: [
      "listas restritivas",
      "compliance contratual",
      "puxar ficha da pessoa pelo cpf",
      "listas restritivas internacionais",
    ],
  },
  {
    client: "Loja Soluções em Embalagens",
    videoUrl: "https://www.youtube.com/embed/iX7ShYZVxgo",
    headline: "Alavancou Vendas e Tráfego",
    description: "A Loja Soluções em Embalagens viu suas vendas e seu tráfego orgânico dispararem após a consultoria e implementação de estratégias de SEO, garantindo um retorno substancial sobre o investimento.",
    metrics: [{ value: "210", label: "Backlinks" }, { value: "85.200", label: "Tráfego Mensal" }],
    keywords: ["Soluções em Embalagens", "Caixas de papelão", "Embalagens sustentáveis", "Packaging personalizado"],
  }
];

const CaseStudySection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-20">
          {testimonials.map((testimonial, index) => (
            <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={`space-y-8 ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    {testimonial.headline}{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600">
                      do {testimonial.client}
                    </span>
                  </h2>
                  
                  <p className="text-lg text-gray-600 mb-8">
                    {testimonial.description}
                  </p>
                </div>
                
                <div className="space-y-4">
                  {testimonial.keywords.map((keyword, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{keyword}</span>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-8 pt-8">
                  {testimonial.metrics.map((metric, i) => (
                    <div key={i} className="text-center">
                      <div className="text-4xl font-bold text-gray-900">{metric.value}</div>
                      <div className="text-gray-600">{metric.label}</div>
                    </div>
                  ))}
                </div>
                
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg">
                  RECEBER AUDITORIA GRÁTIS
                </Button>
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
