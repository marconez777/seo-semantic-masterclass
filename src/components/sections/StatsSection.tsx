
import { Card, CardContent } from "@/components/ui/card";
import { Link, Users, Award } from "lucide-react";

const StatsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Link className="w-8 h-8 text-purple-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900">Autoridade</h3>
              
              <p className="text-gray-600">
                Equipe que prospecta backlinks de autoridade todos os dias.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900">9 Anos de SEO</h3>
              
              <p className="text-gray-600">
                Estamos ajudando negócios a ficarem no topo do Google desde 2016.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900">1.000 Clientes</h3>
              
              <p className="text-gray-600">
                Método exclusivo, testado e validado em mais de 1000 casos de sucesso
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
