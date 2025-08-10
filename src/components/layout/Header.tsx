import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";
import { ShoppingCart } from "lucide-react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const location = useLocation();

  const isPanelRoute = location.pathname.startsWith("/painel");

  const openServices = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const scheduleCloseServices = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setServicesOpen(false), 2000);
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/LOGOMK.png" alt="Logo MK Art" className="w-12 h-12" />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-foreground hover:text-primary font-medium transition-colors">Home</a>

          <div
            className="relative"
            onMouseEnter={openServices}
            onMouseLeave={scheduleCloseServices}
          >
            <button className="inline-flex items-center text-foreground hover:text-primary transition-colors">
              Serviços
            </button>
            {servicesOpen && (
              <div className="absolute left-0 top-full mt-2 z-50">
                <div
                  className="w-72 rounded-md border bg-popover text-popover-foreground shadow-lg p-2"
                  onMouseEnter={openServices}
                  onMouseLeave={scheduleCloseServices}
                >
                  <a href="/comprar-backlinks" className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">Backlinks</a>
                  <a href="/consultoria-de-seo-backlinks" className="block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">Consultoria de SEO</a>
                </div>
              </div>
            )}
          </div>

          <a href="/painel" className="text-foreground hover:text-primary transition-colors">Painel</a>
          {isAdmin && (
            <a href="/admin" className="text-foreground hover:text-primary transition-colors">Admin</a>
          )}
          <a href="/contato" className="text-foreground hover:text-primary transition-colors">Contato</a>
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
            <Button asChild>
              <a href="/auth" aria-label="Ir para Login">Login</a>
            </Button>
          )}
        </div>

      </nav>
    </header>
  );
};
 
export default Header;

