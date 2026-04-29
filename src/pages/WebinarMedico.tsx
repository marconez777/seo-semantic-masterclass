import { useEffect, useRef, useState } from "react";
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
import { webinarTracker } from "@/lib/webinarTracker";

// === Configuráveis ===
const WEBINAR_DATE = "Domingo, 17/05";
const HERO_VIDEO_URL =
  "https://nxitvhrfloibpwrkskzx.supabase.co/storage/v1/object/public/webinar-videos/hero.mp4";
const HERO_POSTER_URL: string | undefined = undefined;
const HERO_VIDEO_ID = "dQw4w9WgXcQ";
const IVAN_VIDEO_ID = "28LzmtmItW0";
const CASE_2_VIDEO_ID = "OWWQfH-V1Iw";
const CASE_3_VIDEO_ID = "eRZUTQthZGI";
const VAGAS_RESTANTES = "03/10";

const MORE_CASES = [
  {
    videoId: CASE_2_VIDEO_ID,
    quote: "Tive um aumento de leads absurdo!",
    name: "Dr. Gabriel",
    specialty: "Psiquiatra",
    city: "Vl. Olímpia",
    metrics: [],
  },
  {
    videoId: CASE_3_VIDEO_ID,
    quote: "10 a 8 leads de todo o Brasil e mais 15 regionais todo dia.",
    name: "Dr. Diego",
    specialty: "Gastroenterologista",
    city: "Fortaleza",
    metrics: [],
  },
];

type CTASource = "hero" | "learn" | "final" | "sticky";

const WebinarMedico = () => {
  const [open, setOpen] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);

  // Init tracker
  useEffect(() => {
    webinarTracker.init();

    // Scroll depth
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

    // Tempo na página (atualiza a cada 5s)
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

  const openModal = (source: CTASource) => {
    const incKey = `cta_${source}_clicks_inc`;
    webinarTracker.patchMetrics({
      cta_clicks_inc: 1,
      [incKey]: 1,
      first_cta_clicked: source,
      signup_modal_opened: true,
    });
    webinarTracker.track("cta_click", { source });
    webinarTracker.track("signup_open", { source });
    setOpen(true);
  };

  return (
    <>
      <SEOHead
        title="Webinar para Donos de Clínica · Domingo 17/05, 10h | MK"
        description="Como clínicas médicas estão substituindo tráfego pago por SEO, GEO e IA. Webinar gratuito ao vivo para donos de clínica."
        canonicalUrl="https://mkart.com.br/webinar-medico"
      />

      <main className="font-sans text-[20px]">
        <WebinarHero onCTAClick={() => openModal("hero")} videoUrl={HERO_VIDEO_URL} posterUrl={HERO_POSTER_URL} vagas={VAGAS_RESTANTES} />
        <WebinarCaseIvan videoId={IVAN_VIDEO_ID} />
        <WebinarLearn onCTAClick={() => openModal("learn")} vagas={VAGAS_RESTANTES} />
        <WebinarMoreCases cases={MORE_CASES} />
        <WebinarForWhom />
        <WebinarHost />
        <WebinarFAQ />
        <WebinarFinalCTA onCTAClick={() => openModal("final")} />
        <WebinarFooter />
      </main>

      <WebinarStickyCTA onCTAClick={() => openModal("sticky")} />
      <WebinarSignupModal open={open} onOpenChange={setOpen} />
    </>
  );
};

export default WebinarMedico;
