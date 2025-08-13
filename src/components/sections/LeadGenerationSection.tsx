import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LeadGenerationSection = () => {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Você em Destaque nas IAs<br />
              e em 1º no Google!
            </h2>
            
            <p className="text-lg text-gray-300 mb-12">
              Domine as melhores posições nos resultados de pesquisa do Google, do Chat GPT e do Perplexity e seja encontrado quando seu cliente mais precisa!
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-600 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">+9 anos</div>
                <div className="text-sm text-gray-400">de expertise em digital em vendas.</div>
              </div>
              <div className="border border-gray-600 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">+3.000</div>
                <div className="text-sm text-gray-400">de projetos de SEO</div>
              </div>
              <div className="border border-gray-600 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">+40</div>
                <div className="text-sm text-gray-400">de clientes ativos.</div>
              </div>
            </div>
            
            <div className="border border-gray-600 rounded-lg p-6 text-center mb-8">
              <div className="text-3xl font-bold text-white mb-2">+R$ 150 milhões</div>
              <div className="text-gray-400">de faturamento gerados desde 2016</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Receba uma Análise Grátis do seu SEO
            </h3>
            <p className="text-gray-300 mb-6">
              e um plano de ação para aparecer nas respostas da IA e no topo do Google
            </p>
            
            <form className="space-y-4">
              <Input
                type="text"
                placeholder="Nome"
                className="bg-white/20 border-white/30 text-white placeholder-gray-300"
              />
              <Input
                type="email"
                placeholder="E-mail"
                className="bg-white/20 border-white/30 text-white placeholder-gray-300"
              />
              <Input
                type="tel"
                placeholder="WhatsApp"
                className="bg-white/20 border-white/30 text-white placeholder-gray-300"
              />
              <Select>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Faturamento Mensal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-1000">Menor que R$ 1.000</SelectItem>
                  <SelectItem value="under-2000">Menor que R$ 2.000</SelectItem>
                  <SelectItem value="2000-3000">R$ 2.000 a R$ 3.000</SelectItem>
                  <SelectItem value="3000-5000">R$ 3.000 a R$ 5.000</SelectItem>
                  <SelectItem value="5000-10000">R$ 5.000 a R$ 10.000</SelectItem>
                  <SelectItem value="over-10000">Mais de R$ 10.000</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold">
                ENVIAR
              </Button>
            </form>
            
            <p className="text-xs text-gray-400 mt-4 text-center">
              Este site é protegido por reCAPTCHA e a Política de Privacidade e os Termos de Serviço do Google se aplicam.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadGenerationSection;