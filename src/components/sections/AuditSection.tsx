import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Auditoria gratuita de backlinks.
 *
 * Substitui a antiga isca "30 sites para guest post": um arquivo pronto entrega
 * o que qualquer um poderia montar, a auditoria entrega uma leitura do site
 * *dele* — e abre conversa, que o arquivo não abre. O gancho é a inspeção do
 * concorrente, não a generosidade.
 *
 * <important>
 * Diferente da isca antiga, **isto não é entrega automática** — cada pedido vira
 * trabalho de alguém. O lead cai em `contact_submissions` e aparece em
 * `/admin/contatos`, reusando o mesmo caminho de `/contato` (mesma tabela, mesmo
 * trigger de validação, mesma edge function de aviso). Se o volume crescer, o
 * gargalo é a equipe, não o formulário.
 * </important>
 */

/**
 * Prazo de entrega prometido na tela. Enquanto for null, a copy simplesmente não
 * cita prazo — melhor não prometer do que prometer um número inventado.
 * Preencher quando a operação definir (ex.: "até 3 dias úteis").
 */
const AUDIT_DELIVERY_LABEL: string | null = null;

const deliverables = [
  "O perfil de links do seu site hoje",
  "De onde o seu concorrente tira os backlinks dele",
  "As lacunas que dá para ocupar primeiro",
  "Quais portais do nosso catálogo fazem sentido para você",
];

const AuditSection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", site: "", competitor: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const site = form.site.trim();
    const competitor = form.competitor.trim();

    if (name.length < 2 || name.length > 100) {
      toast({
        title: "Nome inválido",
        description: "Digite seu nome com pelo menos 2 caracteres.",
      });
      return;
    }
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
      toast({
        title: "E-mail inválido",
        description: "Precisamos de um e-mail válido para enviar a auditoria.",
      });
      return;
    }
    if (!site) {
      toast({
        title: "Falta o site",
        description: "Sem o endereço do site não dá para auditar o perfil de links.",
      });
      return;
    }

    setIsSubmitting(true);

    const message = [
      "Pedido de auditoria gratuita de backlinks",
      `Site: ${site}`,
      `Concorrente: ${competitor || "não informado"}`,
    ].join("\n");

    try {
      const { error } = await supabase
        .from("contact_submissions")
        .insert({ name, email, message });

      if (error) throw error;

      await supabase.functions.invoke("send-contact-email", {
        body: { name, email, message },
      });

      setSent(true);
      setForm({ name: "", email: "", site: "", competitor: "" });
    } catch (error) {
      console.error("Erro ao pedir auditoria:", error);
      toast({
        title: "Não conseguimos registrar o pedido",
        description: "Tente de novo em instantes ou fale com a gente pelo WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="auditoria" className="py-16 md:py-20 bg-muted/40 border-y border-border scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">
              Veja de onde o seu concorrente tira os backlinks dele
            </h2>

            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Analisamos o perfil de links do seu site e o de um concorrente, e
              mostramos onde está a autoridade que falta para você. Sem custo e
              sem compromisso de compra.
            </p>

            <ul className="mt-8 space-y-3">
              {deliverables.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    className="size-5 text-secondary mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            {sent ? (
              <div className="flex flex-col gap-4 text-center py-6">
                <CheckCircle2
                  className="size-12 text-secondary mx-auto"
                  aria-hidden="true"
                />
                <h3 className="text-xl font-bold text-foreground">
                  Pedido registrado
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  A auditoria é feita à mão pela nossa equipe
                  {AUDIT_DELIVERY_LABEL ? ` e chega em ${AUDIT_DELIVERY_LABEL}` : ""}.
                  Ela vai para o e-mail que você informou. Se precisarmos de algum
                  detalhe a mais, a gente chama antes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="audit-name">Seu nome</Label>
                  <Input
                    id="audit-name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audit-email">Seu melhor e-mail</Label>
                  <Input
                    id="audit-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audit-site">Seu site</Label>
                  <Input
                    id="audit-site"
                    value={form.site}
                    onChange={(e) => set("site", e.target.value)}
                    placeholder="seusite.com.br"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audit-competitor">
                    Site do concorrente{" "}
                    <span className="text-muted-foreground font-normal">(opcional)</span>
                  </Label>
                  <Input
                    id="audit-competitor"
                    value={form.competitor}
                    onChange={(e) => set("competitor", e.target.value)}
                    placeholder="concorrente.com.br"
                  />
                  <p className="text-sm text-muted-foreground">
                    Com ele a auditoria fica bem mais útil — é onde aparecem as
                    lacunas.
                  </p>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Pedir minha auditoria"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuditSection;
