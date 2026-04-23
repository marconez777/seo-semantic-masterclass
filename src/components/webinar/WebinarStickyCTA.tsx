import { useEffect, useState } from "react";

interface Props { onCTAClick: () => void; }

export const WebinarStickyCTA = ({ onCTAClick }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(docH > 0 && window.scrollY / docH > 0.4);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={onCTAClick}
      className="fixed bottom-0 left-0 right-0 z-40 bg-webinar-accent text-webinar-navy font-semibold py-4 px-5 text-center text-sm sm:text-base shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.3)] hover:brightness-95 transition"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      QUINTA, 20H · VAGA GRATUITA →
    </button>
  );
};
