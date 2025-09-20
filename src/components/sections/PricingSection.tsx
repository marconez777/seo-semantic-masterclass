import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";

const PricingSection = () => {
  const handlePlanClick = (planName: string) => {
    const message = `Olá! Quero contratar o plano ${planName}.

Gostaria de mais informações sobre os detalhes e como começar.`;
    
    const whatsappUrl = `https://wa.me/5511991795436?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  const plans = [
    {
      name: "Discovery",
      icon: <Zap className="w-6 h-6" />,
      price: "R$ 3.500",
      discountPrice: "R$ 3.000",
      period: "/6 Meses",
      features: [
        "100 Palavras Chaves",
        "10 Textos Otimizados",
        "10 Páginas de Conversão",
        "20 Backlinks DR 20 a 50 por Mês",
        "10 Posts para o Blog",
        "Média Taxa de Resultados"
      ],
      isPopular: false
    },
    {
      name: "Enterprise",
      icon: <Star className="w-6 h-6" />,
      price: "R$ 5.000",
      discountPrice: "R$ 4.500",
      period: "/6 Meses",
      features: [
        "200 Palavras Chaves",
        "20 Textos Otimizados",
        "20 Páginas de Conversão",
        "30 Backlinks DR 20 a 70 por Mês",
        "20 Posts para o Blog",
        "Alta Taxa de Resultados",
        "Rastreio de Leads"
      ],
      isPopular: true
    },
    {
      name: "Supreme",
      icon: <Crown className="w-6 h-6" />,
      price: "R$ 7.000",
      discountPrice: "R$ 6.000",
      period: "/6 Meses",
      features: [
        "500 Palavras Chaves",
        "40 Textos Otimizados",
        "40 Páginas de Conversão",
        "40 Backlinks DR 20 a 90 por Mês",
        "40 Posts para o Blog",
        "Suprema Taxa de Resultados",
        "Rastreio de Leads"
      ],
      isPopular: false
    }
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Planos de Consultoria SEO
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para impulsionar seu negócio com estratégias de SEO personalizadas
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.isPopular 
                  ? 'border-purple-500 shadow-purple-500/25 shadow-xl' 
                  : 'border-border hover:border-purple-300'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-purple-500 text-white text-center py-2 text-sm font-semibold">
                    MAIS POPULAR
                  </div>
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.isPopular ? 'pt-12' : 'pt-8'}`}>
                <div className="mx-auto w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-white mb-4">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl md:text-4xl font-bold text-foreground">
                      {plan.discountPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-lg text-muted-foreground line-through">
                      {plan.price}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Economize
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-6 pb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => handlePlanClick(plan.name)}
                  className="w-full mt-8 py-3 px-6 rounded-lg font-semibold transition-all duration-300 bg-purple-500 text-white hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1"
                >
                  Começar Agora
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Precisa de algo personalizado? Entre em contato!
          </p>
          <a 
            href="#hero-form" 
            className="inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 text-white h-11 px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Falar com Especialista
          </a>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;