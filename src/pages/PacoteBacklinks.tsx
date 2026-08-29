import { useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  Clock,
  Wallet,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PACKAGE_FAQS } from "@/lib/package-faqs";
import {
  getPackageBySlug,
  brl,
  packageTotal,
  packageWhatsAppUrl,
  WHATSAPP_NUMBER,
} from "@/lib/packages";

interface LinkRow {
  anchor: string;
  url: string;
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(value));
    return Boolean(parsed.hostname) && parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

export default function PacoteBacklinks() {
  const { slug } = useParams<{ slug: string }>();
  const pkg = getPackageBySlug(slug);
  const { toast } = useToast();

  const quantity = pkg?.quantity ?? 0;

  // No pacote em que o serviço de âncoras é gratuito, ele já vem marcado.
  const [anchorsByMk, setAnchorsByMk] = useState(pkg?.anchorServicePrice === 0);
  const [customerSite, setCustomerSite] = useState("");
  const [rows, setRows] = useState<LinkRow[]>(() =>
    Array.from({ length: quantity }, () => ({ anchor: "", url: "" }))
  );
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const filledCount = useMemo(
    () => rows.filter((r) => r.url.trim()).length,
    [rows]
  );

  if (!pkg || pkg.ctaType !== "checkout") {
    return <Navigate to="/comprar-backlinks" replace />;
  }

  const total = packageTotal(pkg, anchorsByMk);
  const anchorServicePrice = pkg.anchorServicePrice ?? 0;
  const canonicalUrl = `https://mkart.com.br/pacote-backlinks/${pkg.slug}`;

  const updateRow = (index: number, data: Partial<LinkRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...data } : r)));
  };

  const applyBulk = () => {
    const lines = bulk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) return;

    setRows((prev) =>
      prev.map((row, i) => {
        const line = lines[i];
        if (!line) return row;
        // Aceita "âncora | url", "âncora;url" ou só a url
        const parts = line.split(/\s*[|;]\s*/);
        if (parts.length >= 2) {
          return { anchor: parts[0], url: parts[1] };
        }
        return { ...row, url: line };
      })
    );
    setShowBulk(false);
    setBulk("");
  };

  const repeatFirstUrl = () => {
    const first = rows[0]?.url.trim();
    if (!first) return;
    setRows((prev) => prev.map((r) => (r.url.trim() ? r : { ...r, url: first })));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!name.trim()) next.name = "Informe seu nome";
    if (!email.trim()) {
      next.email = "Informe seu e-mail";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "E-mail inválido";
    }
    if (!phone.trim()) next.phone = "Informe seu WhatsApp";

    if (anchorsByMk) {
      if (!customerSite.trim()) {
        next.customerSite = "Informe o site que vai receber os backlinks";
      } else if (!isValidUrl(customerSite)) {
        next.customerSite = "URL inválida";
      }
    } else {
      rows.forEach((row, i) => {
        if (!row.url.trim()) {
          next[`row-${i}`] = "URL obrigatória";
        } else if (!isValidUrl(row.url)) {
          next[`row-${i}`] = "URL inválida";
        }
      });
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast({
        title: "Faltam informações",
        description: anchorsByMk
          ? "Confira seus dados de contato e o site de destino."
          : `Preencha a URL de destino das ${quantity} linhas ou deixe a MK escolher.`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-package-order", {
        body: {
          package_slug: pkg.slug,
          anchors_by_mk: anchorsByMk,
          customer_site: customerSite.trim() ? normalizeUrl(customerSite) : null,
          contact: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
          },
          links: anchorsByMk
            ? []
            : rows.map((r) => ({
                anchor_text: r.anchor.trim() || null,
                target_url: normalizeUrl(r.url),
              })),
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.ok) throw new Error("Não foi possível enviar o pedido");

      try {
        const { analytics } = await import("@/lib/analytics");
        analytics.track("pacote_pedido_enviado", {
          label: pkg.slug,
          data: { total, anchors_by_mk: anchorsByMk },
        });
      } catch {
        // analytics não pode quebrar o fluxo de compra
      }

      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      console.error("Erro ao enviar pedido de pacote:", err);
      toast({
        title: "Erro ao enviar o pedido",
        description:
          "Tente novamente. Se continuar, chame a gente no WhatsApp que fechamos por lá.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const comprovanteUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Olá! Acabei de enviar o pedido do pacote ${pkg.name} (${brl(total)}) e queria os dados para pagamento.`
  )}`;

  return (
    <>
      <SEOHead
        title={`Pacote ${pkg.name} de Backlinks | MK Art SEO`}
        description={`${quantity} backlinks DA ${pkg.daMin} a ${pkg.daMax} por ${brl(pkg.price ?? 0)}. Entrega em ${pkg.deliveryLabel}.`}
        canonicalUrl={canonicalUrl}
        noindex
      />
      <Header />

      <main className="container mx-auto px-4 py-28">
        <Breadcrumbs
          className="mb-3"
          items={[
            { name: "Início", url: "https://mkart.com.br/" },
            { name: "Comprar Backlinks", url: "https://mkart.com.br/comprar-backlinks" },
            { name: `Pacote ${pkg.name}`, url: canonicalUrl },
          ]}
        />

        {sent ? (
          /* ---------- Pedido enviado: falta o PIX ---------- */
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Check className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-2xl font-bold">Pedido enviado</h1>
                <p className="text-sm text-muted-foreground">
                  Recebemos os seus dados. Já já a gente manda o PIX.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 space-y-4">
              <div>
                <p className="font-semibold">
                  Pacote {pkg.name}: {quantity} backlinks
                </p>
                <p className="text-sm text-muted-foreground">
                  DA {pkg.daMin} a {pkg.daMax}
                  {anchorsByMk ? " · âncoras escolhidas pela MK" : " · âncoras informadas por você"}
                </p>
              </div>

              <div className="flex justify-between items-center border-y border-border py-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">{brl(total)}</span>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">O que acontece agora</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Nossa equipe confere o pedido e manda a chave PIX no seu WhatsApp. Assim
                  que o pagamento entrar, a produção começa e a entrega sai em{" "}
                  {pkg.deliveryLabel}.
                </p>
                <Button asChild variant="outline" className="gap-2">
                  <a href={comprovanteUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-4" />
                    Adiantar pelo WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Qualquer novidade sobre o pedido chega no e-mail {email}.
            </p>
          </div>
        ) : (
          /* ---------- Formulário ---------- */
          <>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Pacote {pkg.name}: {quantity} backlinks
            </h1>
            <p className="text-muted-foreground mb-8">
              DA {pkg.daMin} a {pkg.daMax} · entrega em {pkg.deliveryLabel} · pagamento
              único no PIX
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna do formulário */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quem escolhe as âncoras */}
                <section className="rounded-lg border border-border bg-card p-5">
                  <h2 className="text-lg font-semibold mb-4">Quem escolhe as âncoras?</h2>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setAnchorsByMk(true)}
                      aria-pressed={anchorsByMk}
                      className={`w-full text-left rounded-lg border p-4 transition-colors ${
                        anchorsByMk ? "border-2 border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">A MK analisa meu site e escolhe</span>
                        <span className={anchorServicePrice === 0 ? "text-secondary font-semibold" : "text-primary font-semibold"}>
                          {anchorServicePrice === 0 ? "Incluso" : `+ ${brl(anchorServicePrice)}`}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Nossa equipe estuda o seu site e define as âncoras e as páginas de
                        destino de cada link.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAnchorsByMk(false)}
                      aria-pressed={!anchorsByMk}
                      className={`w-full text-left rounded-lg border p-4 transition-colors ${
                        !anchorsByMk ? "border-2 border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <span className="font-medium">
                        Eu mesmo informo as {quantity} âncoras
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Você preenche a âncora e a página de destino de cada backlink.
                      </p>
                    </button>
                  </div>
                </section>

                {/* Site de destino (quando a MK escolhe) */}
                {anchorsByMk && (
                  <section className="rounded-lg border border-border bg-card p-5">
                    <Label htmlFor="customer-site" className="text-base font-semibold">
                      Qual é o seu site? *
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      É a partir dele que vamos definir as âncoras e as páginas de destino.
                    </p>
                    <Input
                      id="customer-site"
                      placeholder="https://seusite.com.br"
                      value={customerSite}
                      onChange={(e) => setCustomerSite(e.target.value)}
                      className={errors.customerSite ? "border-destructive" : ""}
                    />
                    {errors.customerSite && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="size-3" /> {errors.customerSite}
                      </p>
                    )}
                  </section>
                )}

                {/* Âncoras e destinos */}
                {!anchorsByMk && (
                  <section className="rounded-lg border border-border bg-card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h2 className="text-lg font-semibold">Âncoras e páginas de destino</h2>
                      <span className="text-sm text-muted-foreground">
                        {filledCount} de {quantity} preenchidas
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      A âncora é opcional. A página de destino é obrigatória em todas as
                      linhas, pode repetir a mesma URL.
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowBulk((v) => !v)}>
                        Colar lista em massa
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={repeatFirstUrl} className="gap-2">
                        <Copy className="size-3" /> Repetir a 1ª URL nas vazias
                      </Button>
                    </div>

                    {showBulk && (
                      <div className="mb-4 space-y-2">
                        <Textarea
                          rows={5}
                          value={bulk}
                          onChange={(e) => setBulk(e.target.value)}
                          placeholder={"contador digital | https://seusite.com/servicos\nabrir empresa | https://seusite.com/abrir-empresa"}
                        />
                        <p className="text-xs text-muted-foreground">
                          Uma linha por backlink, no formato <code>âncora | url</code>. Se
                          informar só a URL, a âncora fica em branco.
                        </p>
                        <Button type="button" size="sm" onClick={applyBulk}>
                          Preencher linhas
                        </Button>
                      </div>
                    )}

                    <div className="space-y-3">
                      {rows.map((row, i) => (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-[24px_1fr_1fr] gap-2 sm:items-center">
                          <span className="text-xs text-muted-foreground">{i + 1}</span>
                          <Input
                            placeholder="Âncora (opcional)"
                            value={row.anchor}
                            onChange={(e) => updateRow(i, { anchor: e.target.value })}
                            className="h-9"
                          />
                          <div>
                            <Input
                              placeholder="https://seusite.com/pagina *"
                              value={row.url}
                              onChange={(e) => {
                                updateRow(i, { url: e.target.value });
                                if (errors[`row-${i}`]) {
                                  setErrors((prev) => {
                                    const copy = { ...prev };
                                    delete copy[`row-${i}`];
                                    return copy;
                                  });
                                }
                              }}
                              className={`h-9 ${errors[`row-${i}`] ? "border-destructive" : ""}`}
                            />
                            {errors[`row-${i}`] && (
                              <p className="text-xs text-destructive mt-1">{errors[`row-${i}`]}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <a
                      href={packageWhatsAppUrl(pkg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <MessageCircle className="size-4" />
                      Não sabe o que colocar? Fale com a nossa equipe
                    </a>
                  </section>
                )}

                {/* Contato */}
                <section className="rounded-lg border border-border bg-card p-5">
                  <h2 className="text-lg font-semibold mb-1">Seus dados</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    É por aqui que confirmamos o pagamento e mandamos o relatório de
                    publicação. Não é preciso criar conta.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`mt-1 ${errors.name ? "border-destructive" : ""}`}
                      />
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`mt-1 ${errors.email ? "border-destructive" : ""}`}
                      />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">WhatsApp *</Label>
                      <Input
                        id="phone"
                        placeholder="(11) 90000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`mt-1 ${errors.phone ? "border-destructive" : ""}`}
                      />
                      {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </section>

                {/* Avisos */}
                <section className="rounded-lg border border-border bg-card p-5">
                  <h2 className="text-lg font-semibold mb-4">Antes de finalizar</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {PACKAGE_FAQS.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="text-left text-sm">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              </div>

              {/* Resumo */}
              <aside className="lg:sticky lg:top-24 self-start h-max">
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Resumo
                  </p>
                  <p className="font-semibold">Pacote {pkg.name}</p>
                  <p className="text-sm text-muted-foreground pb-3 mb-3 border-b border-border">
                    {quantity} backlinks · DA {pkg.daMin} – {pkg.daMax}
                  </p>

                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Pacote</span>
                    <span>{brl(pkg.price ?? 0)}</span>
                  </div>
                  {anchorsByMk && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Âncoras pela MK</span>
                      <span>{anchorServicePrice === 0 ? "Incluso" : brl(anchorServicePrice)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center border-t border-border pt-3 mb-4">
                    <span className="text-sm">Total</span>
                    <span className="text-2xl font-bold text-primary">{brl(total)}</span>
                  </div>

                  <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar pedido"
                    )}
                  </Button>

                  <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Clock className="size-3.5 shrink-0" /> Entrega em {pkg.deliveryLabel}
                    </li>
                    <li className="flex items-center gap-2">
                      <Wallet className="size-3.5 shrink-0" /> Pagamento único, à vista no PIX
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="size-3.5 shrink-0" /> Reembolso quando quiser
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
