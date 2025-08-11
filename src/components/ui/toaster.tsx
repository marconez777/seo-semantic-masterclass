import React, { useEffect, useState } from "react";
import { type ToastOptions } from "@/hooks/use-toast";

export function Toaster() {
  const [toasts, setToasts] = useState<Array<{ id: number; title: string; description?: string; duration: number }>>([]);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastOptions>).detail;
      const id = Math.floor(Date.now() + Math.random() * 1000);
      const duration = detail?.duration ?? 2500;
      setToasts((prev) => [...prev, { id, title: detail.title, description: detail.description, duration }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };

    window.addEventListener("app:toast", onToast as EventListener);
    return () => window.removeEventListener("app:toast", onToast as EventListener);
  }, []);

  return (
    <div className="pointer-events-none fixed top-20 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          className="pointer-events-auto rounded-md border bg-card text-card-foreground shadow-lg px-4 py-3 w-72 animate-in fade-in-0 zoom-in-95"
        >
          <div className="text-sm font-medium">{t.title}</div>
          {t.description && <div className="text-xs text-muted-foreground mt-1">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}
