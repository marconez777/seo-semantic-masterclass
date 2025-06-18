
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const CaseStudySection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Mais de{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600">
                    100 Mil Visitas no Site
                  </span>{" "}
                  do Psiquiatra Dr. Gabriel
                </h2>
                
                <p className="text-lg text-gray-600 mb-8">
                  O cliente atingiu 100k de visitas mensais e sua recepcionista chegou até a reclamar de não estar dando conta de tantos atendimentos.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Psiquiatra tdah</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Teste diagnóstico tdah</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Como descobrir tdah teste</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Como saber se eu tenho tdah teste</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">137</div>
                  <div className="text-gray-600">Backlinks</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">115.803</div>
                  <div className="text-gray-600">Tráfego Mensal</div>
                </div>
              </div>
              
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg">
                RECEBER AUDITORIA GRÁTIS
              </Button>
            </div>
            
            <div className="lg:order-last">
              <Card className="border-0 shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-white ml-1"></div>
                      </div>
                      <p>Assista ao Case de Sucesso</p>
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

export default CaseStudySection;
