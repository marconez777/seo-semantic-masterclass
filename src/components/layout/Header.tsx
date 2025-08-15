import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";
import { ShoppingCart } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { useLocation, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [backlinksOpen, setBacklinksOpen] = useState(false);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const location = useLocation();
  
  const isPanelRoute = location.pathname.startsWith("/painel");
  const isLoggedIn = !!userName;
  const { itemsCount } = useCart();
  
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


  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Check role from JWT first, then fallback to database
      const jwtRole = user.app_metadata?.role || user.user_metadata?.role;
      
      if (jwtRole === 'admin') {
        setIsAdmin(true);
      } else {
        // Fallback: check database
        const { data } = await supabase.rpc('is_admin', { uid: user.id });
        setIsAdmin(!!data);
      }
      
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

  if (location.pathname === "/auth") {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/lovable-uploads/cf1b72dd-c973-4cdf-a2f6-fd7ce7ed8d4d.png" alt="Logo MK Art" className="w-12 h-12" />
          </div>
          <div />
        </nav>
      </header>
    );
  }

  if (location.pathname === "/carrinho") {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/lovable-uploads/cf1b72dd-c973-4cdf-a2f6-fd7ce7ed8d4d.png" alt="Logo MK Art" className="w-12 h-12" />
          </div>
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Button asChild>
                <Link to="/painel" aria-label="Ir para o Painel">Painel</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/auth" aria-label="Ir para Login">Login</Link>
              </Button>
            )}
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/lovable-uploads/cf1b72dd-c973-4cdf-a2f6-fd7ce7ed8d4d.png" alt="Logo MK Art" className="w-12 h-12" />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-foreground hover:text-primary font-medium transition-colors">Home</Link>

          <Link to="/consultoria-seo" className="text-foreground hover:text-primary transition-colors">Consultoria SEO</Link>

          <div
            className="relative"
            onMouseEnter={openBacklinks}
            onMouseLeave={scheduleCloseBacklinks}
          >
            <Link
              to="/comprar-backlinks"
              className="inline-flex items-center text-foreground hover:text-primary transition-colors normal-case"
              aria-haspopup="menu"
              aria-expanded={backlinksOpen}
              aria-controls="backlinks-menu"
            >
              Backlinks
            </Link>
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
                      "Notícias",
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
                        <Link
                          key={categoria}
                          to={`/comprar-backlinks-${slug}`}
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
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link to="/contato" className="text-foreground hover:text-primary transition-colors">Contato</Link>
          <Link to="/blog" className="text-foreground hover:text-primary transition-colors">Blog</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isPanelRoute ? (
            <>
              <Link to="/cart" aria-label="Carrinho" className="relative inline-flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent">
                <ShoppingCart className="h-5 w-5" />
                {itemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none ring-2 ring-background">
                    {itemsCount}
                  </span>
                )}
              </Link>
              <UserProfileDropdown
                name={userName ?? 'Visitante'}
                role={isAdmin ? 'Admin' : 'Cliente'}
                onSignOut={() => supabase.auth.signOut()}
                showActions={false}
              />
            </>
          ) : (
            <>
              <Link to="/carrinho" aria-label="Carrinho" className="relative inline-flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent">
                <ShoppingCart className="h-5 w-5" />
                {itemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none ring-2 ring-background">
                    {itemsCount}
                  </span>
                )}
              </Link>
              {isLoggedIn ? (
                <Button asChild>
                  <Link to="/painel" aria-label="Ir para o Painel">Painel</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/auth" aria-label="Ir para Login">Login</Link>
                </Button>
              )}
            </>
          )}
        </div>

      </nav>
    </header>
  );
};
 
export default Header;

