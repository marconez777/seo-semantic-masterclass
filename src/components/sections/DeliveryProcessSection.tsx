import { Card, CardContent } from "@/components/ui/card";
import { Crown, CircleDollarSign, Key, Rocket, PenTool, Link } from "lucide-react";

const DeliveryProcessSection = () => {
  const steps = [
    {
      number: "1",
      title: "Estratégia de Mercado",
      description: "Analisamos qual o seu carro chefe, com maior lucratividade e diferenciais.",
      icon: Crown,
    },
    {
      number: "2", 
      title: "Jornada do Cliente",
      description: "Estudamos o caminho de palavras Topo, Meio e Fundo de Funil que o seu cliente pesquisa.",
      icon: CircleDollarSign,
    },
    {
      number: "3",
      title: "Palavras Chaves",
      description: "Começamos usando as palavras fundo de funil e depois evoluímos para as de meio e topo.",
      icon: Key,
    },
    {
      number: "4",
      title: "LP de Alta Conversão",
      description: "Criamos um modelo de LP para aumentar a potência da campanha de SEO.",
      icon: Rocket,
    },
    {
      number: "5",
      title: "ON Page e Textos",
      description: "Após a redação, enviaremos os artigos aos nossos parceiros e aguardaremos a publicação.",
      icon: PenTool,
    },
    {
      number: "6",
      title: "Backlinks Mensais", 
      description: "Conquistamos backlinks em sites de autoridade para criar um perfil de links sólido e duradouro.",
      icon: Link,
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Processo de Entrega
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <Card key={step.number} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground">
                    {step.number} - {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DeliveryProcessSection;