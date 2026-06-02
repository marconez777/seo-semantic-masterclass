import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/seo/SEOHead";
import { webinarTracker } from "@/lib/webinarTracker";

const WHATSAPP_NUMBER = "5511989151997";

const Diagnostico = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    site: "",
    specialty: "",
    whatsapp: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const ctaTrackedRef = useRef<boolean>(false);

  // Tracking igual ao /webinar-medico
  useEffect(() => {
    webinarTracker.init();
    webinarTracker.track("page_view", { path: "/diagnostico", page: "diagnostico" });

    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH <= 0) return;
      const pct = Math.min(100, Math.round((window.scrollY / docH) * 100));
      if (pct > maxScrollRef.current) {
        maxScrollRef.current = pct;
        webinarTracker.patchMetrics({ scroll_depth_pct: pct });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const interval = window.setInterval(() => {
      const secs = Math.round((Date.now() - startTimeRef.current) / 1000);
      webinarTracker.patchMetrics({ total_time_on_page_seconds: secs });
    }, 5000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(interval);
      const secs = Math.round((Date.now() - startTimeRef.current) / 1000);
      webinarTracker.patchMetrics({ total_time_on_page_seconds: secs });
      webinarTracker.flush(true);
    };
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (!ctaTrackedRef.current) {
      ctaTrackedRef.current = true;
      webinarTracker.track("form_start", { source: "diagnostico" });
      webinarTracker.patchMetrics({ signup_modal_opened: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.site || !formData.whatsapp) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, site da clínica e WhatsApp.",
      });
      return;
    }

    setIsSubmitting(true);
    webinarTracker.track("cta_click", { source: "diagnostico_submit" });
    webinarTracker.patchMetrics({
      cta_clicks_inc: 1,
      first_cta_clicked: "diagnostico_submit",
    });

    try {
      const message = `Olá! Quero meu Diagnóstico Gratuito de SEO para Clínicas.

Dados:
- Nome: ${formData.name}
- Site da clínica: ${formData.site}
- Especialidade: ${formData.specialty || "Não informado"}
- WhatsApp: ${formData.whatsapp}`;

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      webinarTracker.track("signup_submit", { source: "diagnostico" });
      webinarTracker.patchMetrics({
        reached_thank_you: true,
        thank_you_at: new Date().toISOString(),
      });
      webinarTracker.flush(true);

      window.open(whatsappUrl, "_blank");

      toast({
        title: "Redirecionado para WhatsApp",
        description: "Continue a conversa por lá para receber seu diagnóstico.",
      });

      setFormData({ name: "", site: "", specialty: "", whatsapp: "" });
    } catch {
      toast({ title: "Erro", description: "Tente novamente em instantes." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Diagnóstico SEO para Clínicas | MK"
        description="Diagnóstico gratuito de SEO para clínicas: apareça em destaque no Claude, ChatGPT, Perplexity e Google."
        noindex
      />

      <main className="min-h-screen bg-slate-900 text-white relative overflow-hidden flex items-center">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl" />
        </div>

        <section className="container mx-auto px-4 py-16 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Formulário */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Diagnóstico Gratuito de SEO para Clínicas
              </h2>
              <p className="text-gray-300 mb-6">
                Receba uma análise do site da sua clínica e um plano para aparecer
                nas respostas da IA e no topo do Google.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Nome"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                  required
                  maxLength={100}
                />
                <Input
                  type="text"
                  placeholder="Site da clínica"
                  value={formData.site}
                  onChange={(e) => handleInputChange("site", e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                  required
                  maxLength={200}
                />
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => handleInputChange("specialty", value)}
                >
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estetica">Estética</SelectItem>
                    <SelectItem value="odontologia">Odontologia</SelectItem>
                    <SelectItem value="psiquiatria">Psiquiatria</SelectItem>
                    <SelectItem value="psicologia">Psicologia</SelectItem>
                    <SelectItem value="dermatologia">Dermatologia</SelectItem>
                    <SelectItem value="ortopedia">Ortopedia</SelectItem>
                    <SelectItem value="ginecologia">Ginecologia</SelectItem>
                    <SelectItem value="pediatria">Pediatria</SelectItem>
                    <SelectItem value="cardiologia">Cardiologia</SelectItem>
                    <SelectItem value="gastroenterologia">Gastroenterologia</SelectItem>
                    <SelectItem value="outra">Outra especialidade</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  placeholder="WhatsApp (com DDD)"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                  required
                  maxLength={20}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "ENVIANDO..." : "QUERO MEU DIAGNÓSTICO"}
                </Button>
              </form>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Exclusivo para médicos e donos de clínica. Seus dados são tratados
                conforme a LGPD.
              </p>
            </div>

            {/* Headline + stats */}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight">
                Sua Clínica em Destaque no{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  Claude, ChatGPT, Perplexity
                </span>{" "}
                e Google.
              </h1>

              <p className="text-lg text-gray-300 mb-12">
                Domine as primeiras posições quando um paciente pesquisa pelo seu
                tipo de atendimento — no Google e nas principais IAs — e seja
                encontrado na hora que ele mais precisa.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="border border-gray-600 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-white mb-1">+9 anos</div>
                  <div className="text-xs text-gray-400">
                    de experiência em SEO e tráfego
                  </div>
                </div>
                <div className="border border-gray-600 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-white mb-1">+3.000</div>
                  <div className="text-xs text-gray-400">
                    projetos de SEO entregues
                  </div>
                </div>
                <div className="border border-gray-600 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-white mb-1">+40</div>
                  <div className="text-xs text-gray-400">
                    clínicas e marcas ativas
                  </div>
                </div>
              </div>

              <div className="border border-gray-600 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  +R$ 150 milhões
                </div>
                <div className="text-gray-400">
                  em faturamento gerado para clientes desde 2016
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Diagnostico;
