import { useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { WebinarHero } from "@/components/webinar/WebinarHero";
import { WebinarCaseIvan } from "@/components/webinar/WebinarCaseIvan";
import { WebinarLearn } from "@/components/webinar/WebinarLearn";
import { WebinarMoreCases } from "@/components/webinar/WebinarMoreCases";
import { WebinarForWhom } from "@/components/webinar/WebinarForWhom";
import { WebinarHost } from "@/components/webinar/WebinarHost";
import { WebinarFAQ } from "@/components/webinar/WebinarFAQ";
import { WebinarFinalCTA } from "@/components/webinar/WebinarFinalCTA";
import { WebinarFooter } from "@/components/webinar/WebinarFooter";
import { WebinarStickyCTA } from "@/components/webinar/WebinarStickyCTA";
import { WebinarSignupModal } from "@/components/webinar/WebinarSignupModal";

// === Configuráveis ===
const WEBINAR_DATE = "Quinta-feira";
// URL pública do vídeo do webinar (faça upload no bucket "webinar-videos" do backend)
const HERO_VIDEO_URL =
  "https://nxitvhrfloibpwrkskzx.supabase.co/storage/v1/object/public/webinar-videos/hero.mp4";
const HERO_POSTER_URL: string | undefined = undefined;
const HERO_VIDEO_ID = "dQw4w9WgXcQ";
const IVAN_VIDEO_ID = "dQw4w9WgXcQ";
const CASE_2_VIDEO_ID = "dQw4w9WgXcQ";
const CASE_3_VIDEO_ID = "dQw4w9WgXcQ";
const VAGAS_RESTANTES = "03/10";

const MORE_CASES = [
  {
    videoId: CASE_2_VIDEO_ID,
    quote: "Tive um aumento de leads absurdo!",
    name: "Dr. Gabriel",
    specialty: "Psiquiatra",
    city: "Vl. Olímpia",
    metrics: ["+X agendamentos/mês", "1º lugar no Google", "Recomendada pelo Perplexity"],
  },
  {
    videoId: CASE_3_VIDEO_ID,
    quote: "10 a 8 leads de todo o Brasil e mais 15 regionais todo dia.",
    name: "Dr. Diego",
    specialty: "Gastroenterologista",
    city: "Fortaleza",
    metrics: ["+X agendamentos/mês", "1º lugar no Google", "Recomendada pelo Perplexity"],
  },
];

const WebinarMedico = () => {
  const [open, setOpen] = useState(false);
  const openModal = () => setOpen(true);

  return (
    <>
      <SEOHead
        title="Webinar para Donos de Clínica · Quinta, 20h | MK"
        description="Como clínicas médicas estão substituindo tráfego pago por SEO, GEO e IA. Webinar gratuito ao vivo para donos de clínica."
        canonicalUrl="https://mkart.com.br/webinar-medico"
      />

      <main className="font-sans text-[20px]">
        <WebinarHero onCTAClick={openModal} videoUrl={HERO_VIDEO_URL} posterUrl={HERO_POSTER_URL} vagas={VAGAS_RESTANTES} />
        <WebinarCaseIvan videoId={IVAN_VIDEO_ID} />
        <WebinarLearn onCTAClick={openModal} vagas={VAGAS_RESTANTES} />
        <WebinarMoreCases cases={MORE_CASES} />
        <WebinarForWhom />
        <WebinarHost />
        <WebinarFAQ />
        <WebinarFinalCTA onCTAClick={openModal} />
        <WebinarFooter />
      </main>

      <WebinarStickyCTA onCTAClick={openModal} />
      <WebinarSignupModal open={open} onOpenChange={setOpen} />
    </>
  );
};

export default WebinarMedico;
