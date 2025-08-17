import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LeadGenerationSection = () => {
  const { toast } = useToast();
  const [monthlyRevenue, setMonthlyRevenue] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1) Envia e-mail pela Edge Function (já existente)
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: form.name,
          email: form.email,
          message:
            `Telefone: ${form.phone}\n` +
            `Site: ${form.website}\n` +
            `Faturamento: ${monthlyRevenue}\n\n` +
            `${form.message || "Sem mensagem adicional."}`,
        },
      });
      if (error) throw error;

      // 2) (Opcional) Salvar lead no banco (ver SQL da tabela abaixo)
      await supabase.from("leads").insert({
        name: form.name,
        email: form.email,
        phone: form.phone,
        website: form.website,
        monthly_revenue: monthlyRevenue,
        source_page: "/consultoria-seo",
      });

      toast({ title: "Enviado!", description: "Recebemos seus dados. Vamos falar com você :)" });
      setForm({ name: "", email: "", phone: "", website: "", message: "" });
      setMonthlyRevenue("");
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao enviar", description: "Tente novamente ou fale no WhatsApp." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* ...conteúdo à esquerda mantido... */}
      <div id="hero-form" className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
        <h3 className="text-2xl font-bold text-white mb-2">Análise Grátis do seu SEO</h3>
        <p className="text-gray-300 mb-6">
          Preencha seus dados para receber uma análise personalizada do seu site.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" placeholder="Seu nome" value={form.name} onChange={onChange} required />
          <Input name="email" type="email" placeholder="Seu e-mail" value={form.email} onChange={onChange} required />
          <Input name="phone" placeholder="Seu telefone/WhatsApp" value={form.phone} onChange={onChange} />
          <Input name="website" placeholder="URL do seu site (opcional)" value={form.website} onChange={onChange} />

          <Select value={monthlyRevenue} onValueChange={setMonthlyRevenue}>
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

          <textarea
            name="message"
            placeholder="Contexto do seu projeto (opcional)"
            value={form.message}
            onChange={onChange}
            className="w-full min-h-[100px] rounded-md bg-white/20 text-white p-3"
          />

          <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
            {loading ? "Enviando..." : "ENVIAR"}
          </Button>
        </form>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Este site é protegido por reCAPTCHA e a Política de Privacidade e os Termos de Serviço do Google se aplicam.
        </p>
      </div>
    </section>
  );
};

export default LeadGenerationSection;