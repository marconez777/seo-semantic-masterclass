import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "mk_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const expired =
          parsed?.acceptedAt &&
          Date.now() - new Date(parsed.acceptedAt).getTime() >
            365 * 24 * 60 * 60 * 1000;
        if (!expired) return;
      }
    } catch {
      /* noop */
    }
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          status: "accepted",
          acceptedAt: new Date().toISOString(),
          version: "1.0",
        })
      );
    } catch {
      /* noop */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 left-4 z-50 w-[280px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-4 fade-in duration-300 rounded-xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 text-xs leading-snug text-foreground">
          <p>
            Usamos cookies para melhorar sua experiência.{" "}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center font-medium text-foreground underline underline-offset-2 hover:opacity-80"
            >
              Saiba mais
              {expanded ? (
                <ChevronUp size={12} className="ml-0.5" />
              ) : (
                <ChevronDown size={12} className="ml-0.5" />
              )}
            </button>
          </p>
          {expanded && (
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              Veja nossa{" "}
              <Link
                to="/politica-de-privacidade"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Política de Privacidade
              </Link>
              ,{" "}
              <Link
                to="/politica-de-cookies"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Política de Cookies
              </Link>{" "}
              e{" "}
              <Link
                to="/termos-de-uso"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Termos de Uso
              </Link>
              .
            </p>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={accept}
            className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            OK
          </button>
          <button
            type="button"
            onClick={accept}
            aria-label="Fechar aviso de cookies"
            className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
