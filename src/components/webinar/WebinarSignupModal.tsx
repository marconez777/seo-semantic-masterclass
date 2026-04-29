import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { webinarTracker } from "@/lib/webinarTracker";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Answers = {
  nome: string;
  email: string;
  whatsapp: string;
  psiquiatra: "Sim" | "Não" | "";
  faturamento: string;
};

const FATURAMENTOS = [
  "Até R$ 10 mil",
  "Até R$ 20 mil",
  "Até R$ 30 mil",
  "Até R$ 40 mil",
  "Mais de R$ 50 mil",
];

const QUALIFIED_FATURAMENTOS = new Set(["Até R$ 30 mil", "Até R$ 40 mil", "Mais de R$ 50 mil"]);

const nomeSchema = z.string().trim().min(2, "Digite seu nome completo").max(100);
const emailSchema = z.string().trim().email("E-mail inválido").max(255);
const whatsappSchema = z.string().trim().min(8, "WhatsApp inválido").max(25);

export const WebinarSignupModal = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"qualified" | "unqualified" | null>(null);
  const [answers, setAnswers] = useState<Answers>({
    nome: "",
    email: "",
    whatsapp: "",
    psiquiatra: "",
    faturamento: "",
  });

  useEffect(() => {
    if (open) {
      setStep(1);
      setDone(null);
      setAnswers({ nome: "", email: "", whatsapp: "", psiquiatra: "", faturamento: "" });
      webinarTracker.patchMetrics({ signup_modal_opened: true, signup_step_reached: 1 });
      webinarTracker.track("signup_step", { step: 1 });
    }
  }, [open]);

  const update = <K extends keyof Answers>(k: K, v: Answers[K]) =>
    setAnswers((s) => ({ ...s, [k]: v }));

  const next = () => setStep((s) => {
    const ns = s + 1;
    webinarTracker.patchMetrics({ signup_step_reached: ns });
    webinarTracker.track("signup_step", { step: ns });
    return ns;
  });
  const back = () => setStep((s) => Math.max(1, s - 1));

  const validateAndNext = () => {
    if (step === 1) {
      const r = nomeSchema.safeParse(answers.nome);
      if (!r.success) return toast.error(r.error.issues[0].message);
    }
    if (step === 2) {
      const r = emailSchema.safeParse(answers.email);
      if (!r.success) return toast.error(r.error.issues[0].message);
    }
    if (step === 3) {
      const r = whatsappSchema.safeParse(answers.whatsapp);
      if (!r.success) return toast.error(r.error.issues[0].message);
    }
    next();
  };

  const submit = async (faturamento: string) => {
    setSubmitting(true);
    const sessionId = webinarTracker.getSessionId();
    const { error } = await supabase
      .from("webinar_signups")
      .insert([{
        nome: answers.nome.trim(),
        email: answers.email.trim(),
        whatsapp: answers.whatsapp.trim(),
        especialidade: answers.psiquiatra === "Sim" ? "Psiquiatria" : "Outra",
        faturamento,
        source: "webinar-medico",
        session_id: sessionId,
      } as any]);
    setSubmitting(false);

    if (error) {
      toast.error("Não foi possível concluir. Tente novamente.");
      webinarTracker.track("signup_error", { message: error.message });
      return;
    }

    const qualified = answers.psiquiatra === "Sim" && QUALIFIED_FATURAMENTOS.has(faturamento);
    webinarTracker.patchMetrics({
      signup_completed: true,
      signup_qualified: qualified,
      signup_id: inserted?.id ?? null,
    });
    webinarTracker.track("signup_submit", {
      qualified,
      especialidade: answers.psiquiatra,
      faturamento,
    });
    webinarTracker.track(qualified ? "signup_qualified" : "signup_unqualified", {});
    webinarTracker.flush(false);

    if (qualified) {
      onOpenChange(false);
      navigate("/webinar-medico/obrigado");
    } else {
      setDone("unqualified");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-webinar-cream text-webinar-ink border-webinar p-0 overflow-hidden">
        <div className="px-6 sm:px-8 py-8 sm:py-10">
          {done === "unqualified" ? (
            <div className="text-center animate-fade-in">
              <div className="flex justify-center mb-6">
                <CheckCircle2 size={56} className="text-webinar-accent" strokeWidth={1.5} />
              </div>
              <h2 className="font-serif-display text-3xl sm:text-4xl leading-tight font-medium tracking-tight mb-4">
                Obrigado por sua aplicação.
              </h2>
              <p className="text-[18px] leading-relaxed text-webinar-muted mb-8">
                Iremos analisar o seu perfil e entramos em contato.
              </p>
              <button
                onClick={() => onOpenChange(false)}
                className="btn-webinar-cta w-full sm:w-auto"
              >
                Fechar
              </button>
            </div>
          ) : (
            <div key={step} className="animate-fade-in">
              {/* STEP 1 — Nome */}
              {step === 1 && (
                <QuestionLayout
                  title="Qual seu nome?"
                  onBack={null}
                  onNext={validateAndNext}
                >
                  <Input
                    autoFocus
                    value={answers.nome}
                    onChange={(e) => update("nome", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && validateAndNext()}
                    placeholder="Seu nome completo"
                    maxLength={100}
                    className="h-14 text-[18px] bg-white border-webinar focus-visible:ring-webinar-accent"
                  />
                </QuestionLayout>
              )}

              {/* STEP 2 — Email */}
              {step === 2 && (
                <QuestionLayout
                  title="Qual seu e-mail?"
                  onBack={back}
                  onNext={validateAndNext}
                >
                  <Input
                    autoFocus
                    type="email"
                    inputMode="email"
                    value={answers.email}
                    onChange={(e) => update("email", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && validateAndNext()}
                    placeholder="seu@email.com"
                    maxLength={255}
                    className="h-14 text-[18px] bg-white border-webinar focus-visible:ring-webinar-accent"
                  />
                </QuestionLayout>
              )}

              {/* STEP 3 — WhatsApp */}
              {step === 3 && (
                <QuestionLayout
                  title="Qual seu WhatsApp?"
                  onBack={back}
                  onNext={validateAndNext}
                >
                  <Input
                    autoFocus
                    type="tel"
                    inputMode="tel"
                    value={answers.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && validateAndNext()}
                    placeholder="11 99999-9999"
                    maxLength={25}
                    className="h-14 text-[18px] bg-white border-webinar focus-visible:ring-webinar-accent"
                  />
                </QuestionLayout>
              )}

              {/* STEP 4 — Psiquiatra? */}
              {step === 4 && (
                <QuestionLayout title="Você é psiquiatra?" onBack={back} onNext={null}>
                  <div className="grid grid-cols-2 gap-3">
                    {(["Sim", "Não"] as const).map((opt) => (
                      <OptionButton
                        key={opt}
                        label={opt}
                        onClick={() => {
                          update("psiquiatra", opt);
                          next();
                        }}
                      />
                    ))}
                  </div>
                </QuestionLayout>
              )}

              {/* STEP 5 — Faturamento */}
              {step === 5 && (
                <QuestionLayout
                  title="Qual o seu faturamento mensal hoje?"
                  onBack={back}
                  onNext={null}
                >
                  <div className="flex flex-col gap-2.5">
                    {FATURAMENTOS.map((f) => (
                      <OptionButton
                        key={f}
                        label={f}
                        disabled={submitting}
                        onClick={() => {
                          update("faturamento", f);
                          submit(f);
                        }}
                      />
                    ))}
                  </div>
                </QuestionLayout>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const QuestionLayout = ({
  title,
  children,
  onBack,
  onNext,
}: {
  title: string;
  children: React.ReactNode;
  onBack: (() => void) | null;
  onNext: (() => void) | null;
}) => (
  <div>
    <h2 className="font-serif-display text-[26px] sm:text-3xl leading-tight font-medium tracking-tight text-center mb-7">
      {title}
    </h2>
    <div className="mb-6">{children}</div>
    <div className="flex items-center justify-between gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[15px] text-webinar-muted hover:text-webinar-ink transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      ) : (
        <span />
      )}
      {onNext && (
        <button type="button" onClick={onNext} className="btn-webinar-cta">
          Continuar
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  </div>
);

const OptionButton = ({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="w-full text-left px-5 py-4 rounded-xl border-2 border-webinar bg-white text-[17px] font-medium text-webinar-ink shadow-sm transition-all hover:border-webinar-accent hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none"
  >
    {label}
  </button>
);
