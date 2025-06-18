
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube } from "lucide-react";

const FounderSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Jornada do{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  CEO
                </span>{" "}
                e Fundador
              </h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Desde os 20 anos de idade, já tinha iniciado como web designer autônomo, criando sites e revendendo planos de hospedagem.
                </p>
                
                <p>
                  Vi no SEO a oportunidade de criar uma recorrência e aumentar os lucros de meus clientes.
                </p>
                
                <p>
                  Foi então que com 27 anos iniciei minha jornada no SEO e venho aplicando, testando e validando a cada atualização do Google.
                </p>
                
                <p>
                  Hoje com 34 anos e muita estrada, comemoramos eu e minha equipe mais de 1000 clientes atendidos e a grande maioria muito satisfeita.
                </p>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Button variant="outline" size="icon" className="rounded-full w-12 h-12 bg-purple-600 text-white border-purple-600 hover:bg-purple-700">
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-12 h-12 bg-purple-600 text-white border-purple-600 hover:bg-purple-700">
                  <Youtube className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="lg:order-last">
              <Card className="relative border-0 shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-end justify-center relative">
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
                      <h3 className="text-2xl font-bold">Marco Guimarães</h3>
                      <p className="text-purple-100">CEO & Founder</p>
                    </div>
                    
                    {/* Placeholder for founder image */}
                    <div className="w-full h-full bg-gradient-to-b from-transparent to-gray-300 flex items-center justify-center">
                      <div className="text-gray-500 text-center">
                        <div className="w-32 h-32 bg-gray-400 rounded-full mx-auto mb-4"></div>
                        <p>Marco Guimarães</p>
                      </div>
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
