
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Atom, Link as LinkIcon } from "lucide-react";

const ServicesSection = () => {
  return (
    <section id="servicos" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="text-center space-y-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Atom className="w-8 h-8 text-purple-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900">
                Consultoria de SEO
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                Nossa equipe vai aplicar um método validado no seu site para conseguir resultados espetaculares em 3 meses. Garantido!
              </p>
            </CardContent>
          </Card>
          
          <Link to="/comprar-backlinks" className="block">
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="text-center space-y-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <LinkIcon className="w-8 h-8 text-purple-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900">
                  Loja de Backlinks
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  Lista com os melhores sites do Brasil para colocar backlinks, com filtragem de métricas, nichos e valores.
                  Escolha e compre agora!
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
