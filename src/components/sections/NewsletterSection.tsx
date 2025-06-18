
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NewsletterSection = () => {
  return (
    <section className="py-20 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Receba agora uma
          </h2>
          
          <div className="relative">
            <div className="border-4 border-green-400 rounded-full px-8 py-4 inline-block transform rotate-1">
              <span className="text-2xl md:text-3xl font-bold text-purple-400">
                Lista com 70 Backlinks DR até 90 GRÁTIS!
              </span>
            </div>
          </div>
          
          <p className="text-xl text-gray-300">no seu e-mail</p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <Input 
              type="email" 
              placeholder="Seu melhor e-mail"
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 flex-1"
            />
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
              Receber Grátis
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
