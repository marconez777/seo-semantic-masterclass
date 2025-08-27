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
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-blue-400 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-40 h-40 bg-purple-400 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent mb-4">
            Processo de Entrega
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-6xl mx-auto">
          {/* Timeline container */}
          <div className="relative">
            {/* Central timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-blue-600 rounded-full hidden lg:block"></div>
            
            {/* Timeline dots */}
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className="absolute w-6 h-6 bg-white border-4 border-blue-500 rounded-full shadow-lg animate-pulse"
                  style={{
                    top: `${(index * 100) / (steps.length - 1)}%`,
                    marginTop: index === 0 ? '60px' : index === steps.length - 1 ? '-60px' : '0px',
                    animationDelay: `${index * 0.2}s`
                  }}
                ></div>
              ))}
            </div>
            
            {/* Timeline items */}
            <div className="space-y-24 lg:space-y-32">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div
                    key={step.number}
                    className={`flex items-center ${
                      isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    } flex-col lg:justify-between`}
                    style={{
                      animation: `fade-in 0.6s ease-out ${index * 0.2}s both`
                    }}
                  >
                    {/* Content card */}
                    <div className={`lg:w-5/12 w-full ${isEven ? 'lg:pr-16' : 'lg:pl-16'}`}>
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover-scale group">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              <IconComponent className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                              {step.number}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                              {step.title}
                            </h3>
                          </div>
                        </div>
                        
                        <p className="text-slate-600 leading-relaxed text-lg">
                          {step.description}
                        </p>
                        
                        {/* Progress indicator */}
                        <div className="mt-6 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${((index + 1) / steps.length) * 100}%`,
                                animationDelay: `${index * 0.3}s`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-slate-500">
                            {Math.round(((index + 1) / steps.length) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Spacer for timeline */}
                    <div className="lg:w-2/12 hidden lg:block"></div>
                    
                    {/* Empty space to balance the layout */}
                    <div className="lg:w-5/12 hidden lg:block"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover-scale">
            <Rocket className="w-5 h-5" />
            Comece Agora Sua Jornada de Sucesso
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliveryProcessSection;