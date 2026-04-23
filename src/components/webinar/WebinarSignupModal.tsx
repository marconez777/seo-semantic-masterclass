import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  email: z.string().trim().email("E-mail inválido").max(255),
  whatsapp: z.string().trim().min(8, "WhatsApp inválido").max(25),
  especialidade: z.string().min(2, "Selecione a especialidade").max(100),
  faturamento: z.string().min(2, "Selecione o faturamento").max(50),
});

const ESPECIALIDADES = [
  "Psiquiatria", "Psicologia", "Gastroenterologia", "Endocrinologia",
  "Dermatologia", "Ortopedia", "Ginecologia", "Cardiologia",
  "Pediatria", "Neurologia", "Oftalmologia", "Otorrinolaringologia",
  "Urologia", "Outra",
];

const FATURAMENTOS = [
  "Até R$ 3.000",
  "Até R$ 5.000",
  "Até R$ 10.000",
  "Até R$ 50.000",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WebinarSignupModal = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: "", email: "", whatsapp: "", especialidade: "", faturamento: "",
  });

  const update = (k: keyof typeof form) => (v: string) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("webinar_signups").insert({
      ...parsed.data,
      source: "webinar-medico",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível concluir a inscrição. Tente novamente.");
      return;
    }
    toast.success("Inscrição confirmada!");
    onOpenChange(false);
    navigate("/webinar-medico/obrigado");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-webinar-cream text-webinar-ink border-webinar">
        <DialogHeader>
          <DialogTitle className="font-serif-display text-2xl">Confirme sua inscrição</DialogTitle>
          <DialogDescription className="text-webinar-muted">
            Webinar gratuito · Quinta-feira · 20h
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="w-nome">Nome completo</Label>
            <Input id="w-nome" value={form.nome} onChange={(e) => update("nome")(e.target.value)} required maxLength={100} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="w-email">E-mail</Label>
            <Input id="w-email" type="email" inputMode="email" value={form.email} onChange={(e) => update("email")(e.target.value)} required maxLength={255} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="w-wpp">WhatsApp (com DDD)</Label>
            <Input id="w-wpp" type="tel" inputMode="tel" placeholder="11 99999-9999" value={form.whatsapp} onChange={(e) => update("whatsapp")(e.target.value)} required maxLength={25} />
          </div>

          <div className="space-y-1.5">
            <Label>Especialidade</Label>
            <Select value={form.especialidade} onValueChange={update("especialidade")}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {ESPECIALIDADES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Faturamento mensal da clínica</Label>
            <Select value={form.faturamento} onValueChange={update("faturamento")}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {FATURAMENTOS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <button type="submit" disabled={submitting} className="btn-webinar-cta w-full disabled:opacity-60">
            {submitting ? "Enviando..." : "Confirmar minha inscrição →"}
          </button>

          <p className="text-xs text-webinar-muted text-center leading-relaxed">
            Você precisa entrar no grupo do WhatsApp na próxima página para receber o link da aula.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
