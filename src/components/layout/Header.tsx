import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";
import { ShoppingCart, Folder, Newspaper, Briefcase, HeartPulse, GraduationCap, Cpu, Wallet, Home, Shirt, Plane, Utensils, PawPrint, Car, Dumbbell, Clapperboard, Megaphone, Scale } from "lucide-react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [backlinksOpen, setBacklinksOpen] = useState(false);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const location = useLocation();
  
  const isPanelRoute = location.pathname.startsWith("/painel");
  
  const openBacklinks = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (openTimer.current) window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => setBacklinksOpen(true), 500);
  };
  const scheduleCloseBacklinks = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setBacklinksOpen(false), 500);
  };

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case "Noticias":
        return Newspaper;
      case "Negócios":
        return Briefcase;
      case "Saúde":
        return HeartPulse;
      case "Educação":
        return GraduationCap;
      case "Tecnologia":
        return Cpu;
      case "Finanças":
        return Wallet;
      case "Casa":
        return Home;
      case "Moda":
        return Shirt;
      case "Turismo":
        return Plane;
      case "Alimentação":
        return Utensils;
      case "Pets":
        return PawPrint;
      case "Automotivo":
        return Car;
      case "Esportes":
        return Dumbbell;
      case "Entretenimento":
        return Clapperboard;
      case "Marketing":
        return Megaphone;
      case "Direito":
        return Scale;
      default:
        return Folder;
    }
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      setIsAdmin(!!data);
      setUserName((user.user_metadata as any)?.name || user.email || null);
    })();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (openTimer.current) window.clearTimeout(openTimer.current);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  if (location.pathname === "/carrinho") {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/LOGOMK.png" alt="Logo MK Art" className="w-12 h-12" />
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button asChild>
              <a href="/auth" aria-label="Ir para Login">Login</a>
            </Button>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/LOGOMK.png" alt="Logo MK Art" className="w-12 h-12" />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-foreground hover:text-primary font-medium transition-colors">Home</a>

          <a href="/consultoria-de-seo-backlinks" className="text-foreground hover:text-primary transition-colors">Consultoria SEO</a>

          <div
            className="relative"
            onMouseEnter={openBacklinks}
            onMouseLeave={scheduleCloseBacklinks}
          >
            <a
              href="/comprar-backlinks"
              className="inline-flex items-center text-foreground hover:text-primary transition-colors normal-case"
              aria-haspopup="menu"
              aria-expanded={backlinksOpen}
              aria-controls="backlinks-menu"
            >
              Backlinks
            </a>
            {backlinksOpen && (
              <div className="absolute left-0 top-full mt-2 z-50">
                <div
                  id="backlinks-menu"
                  role="menu"
                  className="min-w-[560px] md:min-w-[720px] rounded-lg border bg-popover text-popover-foreground shadow-lg p-3 animate-enter"
                  onMouseEnter={openBacklinks}
                  onMouseLeave={scheduleCloseBacklinks}
                >
                  <div className="px-2 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Categorias</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                    {[
                      "Noticias",
                      "Negócios",
                      "Saúde",
                      "Educação",
                      "Tecnologia",
                      "Finanças",
                      "Casa",
                      "Moda",
                      "Turismo",
                      "Alimentação",
                      "Pets",
                      "Automotivo",
                      "Esportes",
                      "Entretenimento",
                      "Marketing",
                      "Direito",
                    ].map((categoria) => {
                      const slug = categoria
                        .toLowerCase()
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        .replace(/\s+/g, "-");
                      return (
                        <a
                          key={categoria}
                          href={`/comprar-backlinks-${slug}`}
                          className="group flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors hover-scale"
                          role="menuitem"
                        >
                          {(() => { const IconComp = getCategoryIcon(categoria); return (
                            <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shadow-sm">
                              <IconComp className="size-4" aria-hidden="true" />
                            </span>
                          ); })()}
                          <span className="flex flex-col">
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground leading-none">Backlinks de</span>
                            <span className="text-sm font-semibold leading-none mt-1">{categoria}</span>
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <a href="/contato" className="text-foreground hover:text-primary transition-colors">Contato</a>
          <a href="/blog" className="text-foreground hover:text-primary transition-colors">Blog</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isPanelRoute ? (
            <>
              <a href="/cart" aria-label="Carrinho" className="inline-flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent">
                <ShoppingCart className="h-5 w-5" />
              </a>
              <UserProfileDropdown
                name={userName ?? 'Visitante'}
                role={isAdmin ? 'Admin' : 'Cliente'}
                onSignOut={() => supabase.auth.signOut()}
                showActions={false}
              />
            </>
          ) : (
            <>
              <a href="/carrinho" aria-label="Carrinho" className="inline-flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent">
                <ShoppingCart className="h-5 w-5" />
              </a>
              <Button asChild>
                <a href="/auth" aria-label="Ir para Login">Login</a>
              </Button>
            </>
          )}
        </div>

      </nav>
    </header>
  );
};
 
export default Header;

